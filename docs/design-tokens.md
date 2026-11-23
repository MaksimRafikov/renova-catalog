# Design tokens — РеНова+

Источник: `Фирменный стиль/РеНова+.pdf` (корпоративные цвета, стр. 6).

## Цвета

| Токен | Hex | RGB | Роль |
| --- | --- | --- | --- |
| `--brand-navy` | `#222849` | 34 / 40 / 73 | основной тёмный (лого, заголовки, header) |
| `--brand-sky` | `#49A1DA` | 73 / 161 / 218 | акцент CTA / активные фильтры |
| `--brand-slate` | `#73859f` | 117 / 134 / 160 | вторичный текст, подписи |
| `--brand-mist` | `#ececec` | 236 / 236 / 236 | фон страницы / плашки |
| `--brand-graphite` | `#575756` | 87 / 87 / 86 | приглушённый текст |
| `--brand-white` | `#ffffff` | 255 / 255 / 255 | поверхности |

В CSS (`css/styles.css`):

```css
--bg: #ececec;
--surface: #ffffff;
--text: #222849;
--muted: #575756;
--border: #d8dee6;
--accent: #49A1DA;
--accent-hover: #2f86bd;
--navy: #222849;
--slate: #73859f;
```

## Типографика (брендбук)

- Логотип: **Gotham Pro Medium** (в вебе — близкий гротеск с кириллицей).
- Деловые документы: **Calibri**.
- Каталог (web): **Manrope** (display/UI) + **Source Sans 3** (body) — без Inter/Roboto/Arial.

## Логотип

- Исходник: `Фирменный стиль/лого РеНова  (4).pdf` → `assets/brand/logo.png` (полный знак с подписью)
- Header (compact): `assets/brand/logo-header.png` — знак + «РеНова+» без микроподписи
- Legacy: `assets/brand/logo-mark.png`, `assets/brand/logo-compact.png`
- OG: `assets/brand/og-share.png`

Не использовать цвета Ellis / За Комфортом (`#1f5f4e` и т.п.).
