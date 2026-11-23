#!/usr/bin/env python3
"""Resize and web-optimize catalog images before publishing in assets/."""

from __future__ import annotations

import re
from pathlib import Path

from PIL import Image, ImageOps

OPTIMIZED_MARKER = "zk-optimized-v1"
LEGACY_PROTECTED_MARKER = "zk-protected-v1"
MAX_WEB_DIMENSION = 1440
JPEG_QUALITY = 82
WEBP_QUALITY = 80
# Responsive variants generated next to each master image:
#   <stem>-640.jpg / <stem>-640.webp / <stem>-1024.webp / <stem>.webp
VARIANT_WIDTHS = (640, 1024)
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}
SKIP_DIRS = {"brand"}
PHOTO_PREFIXES = ("after-", "before-", "compare-")
# Drop letterbox/pillarbox (white or near-white uniform edges) before publish.
BORDER_CROP_THRESHOLD = 248
BORDER_CROP_MIN_PX = 8
BORDER_CROP_MAX_SIDE_FRACTION = 0.25
BORDER_CROP_CHANNEL_DELTA = 12

_VARIANT_STEM_RE = re.compile(
    r"-(?:%s)$" % "|".join(str(w) for w in VARIANT_WIDTHS)
)


def is_variant_file(path: Path) -> bool:
    """True for generated files: width variants and full-size webp twins."""
    if _VARIANT_STEM_RE.search(path.stem):
        return True
    if path.suffix.lower() == ".webp":
        for ext in (".jpg", ".jpeg", ".png"):
            if path.with_suffix(ext).exists():
                return True
    return False


def is_photo_filename(name: str) -> bool:
    lower = name.lower()
    return lower.startswith(PHOTO_PREFIXES)


def output_path_for(path: Path) -> Path:
    if is_photo_filename(path.name):
        return path.with_suffix(".jpg")
    return path


def is_optimized_image(path: Path) -> bool:
    try:
        with Image.open(path) as img:
            if img.info.get("zk_optimized") == OPTIMIZED_MARKER:
                return True
            if img.info.get("zk_protected") in (OPTIMIZED_MARKER, LEGACY_PROTECTED_MARKER):
                return True
            exif = img.getexif()
            if exif:
                for value in exif.values():
                    if isinstance(value, (bytes, str)) and (
                        OPTIMIZED_MARKER in str(value)
                        or LEGACY_PROTECTED_MARKER in str(value)
                    ):
                        return True
    except OSError:
        return False
    return False


# Backward-compatible alias used by validate-cases.py
is_protected_image = is_optimized_image


def _resize_for_web(img: Image.Image) -> Image.Image:
    w, h = img.size
    longest = max(w, h)
    if longest <= MAX_WEB_DIMENSION:
        return img
    scale = MAX_WEB_DIMENSION / longest
    new_size = (max(1, int(w * scale)), max(1, int(h * scale)))
    return img.resize(new_size, Image.Resampling.LANCZOS)


def _apply_exif_orientation(img: Image.Image) -> Image.Image:
    """Bake EXIF Orientation into pixels so stripped web JPEGs stay upright."""
    transposed = ImageOps.exif_transpose(img)
    return transposed if transposed is not None else img


def _flatten_to_rgb(img: Image.Image) -> Image.Image:
    if img.mode in ("RGBA", "LA", "P"):
        rgba = img.convert("RGBA")
        background = Image.new("RGB", rgba.size, (255, 255, 255))
        background.paste(rgba, mask=rgba.split()[-1])
        return background
    return img.convert("RGB")


def _is_uniform_light_pixel(rgb: tuple[int, int, int], *, threshold: int) -> bool:
    r, g, b = rgb
    if r < threshold or g < threshold or b < threshold:
        return False
    return max(r, g, b) - min(r, g, b) <= BORDER_CROP_CHANNEL_DELTA


def measure_uniform_borders(
    img: Image.Image, *, threshold: int = BORDER_CROP_THRESHOLD
) -> tuple[int, int, int, int]:
    """Return (left, top, right, bottom) light uniform border widths in px."""
    rgb = img.convert("RGB") if img.mode != "RGB" else img
    w, h = rgb.size
    px = rgb.load()
    y_step = max(1, h // 48)
    x_step = max(1, w // 48)

    def col_is_bar(x: int) -> bool:
        return all(
            _is_uniform_light_pixel(px[x, y], threshold=threshold)
            for y in range(0, h, y_step)
        )

    def row_is_bar(y: int) -> bool:
        return all(
            _is_uniform_light_pixel(px[x, y], threshold=threshold)
            for x in range(0, w, x_step)
        )

    max_x = max(BORDER_CROP_MIN_PX, int(w * BORDER_CROP_MAX_SIDE_FRACTION))
    max_y = max(BORDER_CROP_MIN_PX, int(h * BORDER_CROP_MAX_SIDE_FRACTION))

    left = 0
    while left < max_x and col_is_bar(left):
        left += 1
    right = 0
    while right < max_x and col_is_bar(w - 1 - right):
        right += 1
    top = 0
    while top < max_y and row_is_bar(top):
        top += 1
    bottom = 0
    while bottom < max_y and row_is_bar(h - 1 - bottom):
        bottom += 1

    if left < BORDER_CROP_MIN_PX:
        left = 0
    if right < BORDER_CROP_MIN_PX:
        right = 0
    if top < BORDER_CROP_MIN_PX:
        top = 0
    if bottom < BORDER_CROP_MIN_PX:
        bottom = 0

    # Keep a usable frame if detection over-crops.
    if w - left - right < max(64, w // 3):
        left = right = 0
    if h - top - bottom < max(64, h // 3):
        top = bottom = 0
    return left, top, right, bottom


def crop_uniform_borders(
    img: Image.Image, *, threshold: int = BORDER_CROP_THRESHOLD
) -> Image.Image:
    """Remove letterbox/pillarbox so gallery `object-fit: cover` never shows white rails."""
    left, top, right, bottom = measure_uniform_borders(img, threshold=threshold)
    if left == top == right == bottom == 0:
        return img
    w, h = img.size
    return img.crop((left, top, w - right, h - bottom))


def is_plan_filename(name: str) -> bool:
    return name.lower().startswith("plan")


def pad_plan_margins(
    img: Image.Image, *, min_fraction: float = 0.035, min_px: int = 28
) -> Image.Image:
    """Ensure white breathing room so labels are not flush against the frame."""
    w, h = img.size
    target = max(min_px, int(round(min(w, h) * min_fraction)))
    left, top, right, bottom = measure_uniform_borders(img, threshold=BORDER_CROP_THRESHOLD)
    pad_l = max(0, target - left)
    pad_t = max(0, target - top)
    pad_r = max(0, target - right)
    pad_b = max(0, target - bottom)
    if pad_l == pad_t == pad_r == pad_b == 0:
        return img
    return ImageOps.expand(img, border=(pad_l, pad_t, pad_r, pad_b), fill=(255, 255, 255))


def variant_targets(master: Path, width: int) -> tuple[Path, Path]:
    """(same-format variant, webp variant) paths for a given width."""
    return (
        master.with_name(f"{master.stem}-{width}{master.suffix}"),
        master.with_name(f"{master.stem}-{width}.webp"),
    )


def expected_variants(master: Path) -> list[Path]:
    """Variant files that should exist next to an optimized master image."""
    paths = [master.with_suffix(".webp")]
    try:
        with Image.open(master) as img:
            master_width = img.size[0]
    except OSError:
        return paths
    for width in VARIANT_WIDTHS:
        if master_width > width:
            paths.extend(variant_targets(master, width))
    return paths


def _save_webp(img: Image.Image, target: Path) -> None:
    img.save(target, "WEBP", quality=WEBP_QUALITY, method=6)


def generate_variants(master: Path) -> list[Path]:
    """(Re)create the webp twin and narrow width variants for a master image."""
    created: list[Path] = []
    with Image.open(master) as opened:
        img = _flatten_to_rgb(opened)
    w, h = img.size

    webp_full = master.with_suffix(".webp")
    _save_webp(img, webp_full)
    created.append(webp_full)

    for width in VARIANT_WIDTHS:
        variant, variant_webp = variant_targets(master, width)
        if w <= width:
            for stale in (variant, variant_webp):
                if stale.exists():
                    stale.unlink()
            continue
        resized = img.resize(
            (width, max(1, round(h * width / w))), Image.Resampling.LANCZOS
        )
        if variant.suffix.lower() == ".png":
            resized.save(variant, optimize=True)
        else:
            resized.save(variant, quality=JPEG_QUALITY, optimize=True, subsampling=2)
        _save_webp(resized, variant_webp)
        created.extend([variant, variant_webp])
    return created


def ensure_variants(master: Path) -> list[Path]:
    """Generate variants only when some expected file is missing."""
    if any(not p.exists() for p in expected_variants(master)):
        return generate_variants(master)
    return []


def optimize_image_file(path: Path, *, force: bool = False) -> Path | None:
    """Resize and optimize for web. Returns final path, or None if skipped."""
    if path.suffix.lower() not in IMAGE_SUFFIXES:
        return None
    if is_variant_file(path):
        return None

    out_path = output_path_for(path)
    if not force and out_path.exists() and is_optimized_image(out_path):
        ensure_variants(out_path)
        return None
    if not force and out_path == path and is_optimized_image(path):
        ensure_variants(path)
        return None

    with Image.open(path) as opened:
        img = _flatten_to_rgb(_apply_exif_orientation(opened))

    # Plans: keep / restore margins (labels sit in the letterbox). Photos: crop rails.
    if is_plan_filename(path.name):
        img = pad_plan_margins(img)
    else:
        img = crop_uniform_borders(img)
    img = _resize_for_web(img)

    if out_path.suffix.lower() == ".png":
        from PIL import PngImagePlugin

        meta = PngImagePlugin.PngInfo()
        meta.add_text("zk_optimized", OPTIMIZED_MARKER)
        img.save(out_path, optimize=True, pnginfo=meta)
    else:
        exif = Image.Exif()
        exif[0x9286] = OPTIMIZED_MARKER.encode("utf-8")
        img.save(
            out_path,
            quality=JPEG_QUALITY,
            optimize=True,
            subsampling=2,
            exif=exif,
        )

    if out_path != path and path.exists():
        path.unlink()

    generate_variants(out_path)
    return out_path


# Backward-compatible alias used by process-assets.py
protect_image_file = optimize_image_file


def natural_sort_key(path: Path) -> list:
    parts = re.split(r"(\d+)", path.name.lower())
    return [int(part) if part.isdigit() else part for part in parts]


def should_skip_assets_path(path: Path, assets_root: Path) -> bool:
    try:
        rel_parts = path.relative_to(assets_root).parts
    except ValueError:
        return True
    if not rel_parts:
        return True
    if rel_parts[0] in SKIP_DIRS:
        return True
    if path.name.startswith("."):
        return True
    if path.name.lower() == "readme.md":
        return True
    return False


def iter_case_images(assets_root: Path) -> list[Path]:
    """Master images only; generated variants (-640/-1024/webp twins) are skipped."""
    files: list[Path] = []
    if not assets_root.exists():
        return files
    for path in sorted(assets_root.rglob("*")):
        if not path.is_file():
            continue
        if should_skip_assets_path(path, assets_root):
            continue
        if path.suffix.lower() not in IMAGE_SUFFIXES:
            continue
        if is_variant_file(path):
            continue
        files.append(path)
    return files
