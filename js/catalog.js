(function () {
  const COMPLEX_PARAM = "complex";
  const AREA_PARAM = "area";
  const BRANCH_PARAM = "branch";

  const BRANCHES = {
    design: {
      id: "design",
      label: "Дизайны",
      cardLabel: "Дизайн",
    },
    repair: {
      id: "repair",
      label: "Ремонты",
      cardLabel: "Ремонт",
    },
  };

  const AREA_BANDS = [
    { id: "", label: "Любая площадь" },
    { id: "0-45", label: "до 45 м²", min: 0, max: 45 },
    { id: "45-70", label: "45–70 м²", min: 45, max: 70 },
    { id: "70+", label: "от 70 м²", min: 70, max: Infinity },
  ];

  const state = {
    branch: "",
    complex: "",
    area: "",
  };

  function branchMeta(id) {
    return BRANCHES[id] || null;
  }

  function areaBandById(id) {
    return AREA_BANDS.find((b) => b.id === id) || AREA_BANDS[0];
  }

  function matchesArea(c) {
    const band = areaBandById(state.area);
    if (!band.id) return true;
    const sqm = typeof c.areaSqm === "number" ? c.areaSqm : null;
    if (sqm === null) return false;
    return sqm >= band.min && sqm < band.max;
  }

  function matchesFilters(c) {
    if (state.branch && c.branch !== state.branch) return false;
    if (state.complex && c.complex !== state.complex) return false;
    if (!matchesArea(c)) return false;
    return true;
  }

  function casesForBranch() {
    if (!state.branch) return [];
    return CASES.filter((c) => c.branch === state.branch);
  }

  function complexesForBranch() {
    const set = new Set(casesForBranch().map((c) => c.complex).filter(Boolean));
    return Array.from(set).sort();
  }

  function readBranchFromUrl() {
    const val = new URLSearchParams(window.location.search).get(BRANCH_PARAM) || "";
    return branchMeta(val) ? val : "";
  }

  function readComplexFromUrl() {
    const val = new URLSearchParams(window.location.search).get(COMPLEX_PARAM) || "";
    return complexesForBranch().includes(val) ? val : "";
  }

  function readAreaFromUrl() {
    const val = new URLSearchParams(window.location.search).get(AREA_PARAM) || "";
    return AREA_BANDS.some((b) => b.id === val) ? val : "";
  }

  function syncFiltersToUrl() {
    const url = new URL(window.location.href);
    if (state.branch) url.searchParams.set(BRANCH_PARAM, state.branch);
    else url.searchParams.delete(BRANCH_PARAM);
    if (state.complex) url.searchParams.set(COMPLEX_PARAM, state.complex);
    else url.searchParams.delete(COMPLEX_PARAM);
    if (state.area) url.searchParams.set(AREA_PARAM, state.area);
    else url.searchParams.delete(AREA_PARAM);
    history.replaceState(null, "", url);
  }

  function updateFilterStatus(count) {
    const el = document.getElementById("filter-status");
    if (!el) return;

    const total = casesForBranch().length;
    const parts = [];
    if (state.complex) parts.push(state.complex);
    if (state.area) parts.push(areaBandById(state.area).label);
    if (parts.length) {
      el.textContent = `Показано ${count} из ${total}: ${parts.join(" · ")}`;
    } else {
      el.textContent = `Объекты: ${count}`;
    }
  }

  function setActiveChip(row, value) {
    row.querySelectorAll(".chip[data-value]").forEach((chip) => {
      const chipValue = chip.getAttribute("data-value") || "";
      const isActive = value === chipValue;
      chip.classList.toggle("chip--active", isActive);
      chip.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function applyFilters() {
    const list = CASES.filter(matchesFilters);
    renderCards(list);
    updateFilterStatus(list.length);
    syncFiltersToUrl();
  }

  function caseHref(id) {
    return `cases/${encodeURIComponent(id)}/`;
  }

  function bindCardNavigation(grid) {
    if (!grid || grid.dataset.navBound === "1") return;
    grid.dataset.navBound = "1";

    function goCard(card) {
      const id = card.getAttribute("data-id") || "";
      if (!id) return;
      window.location.assign(caseHref(id));
    }

    grid.addEventListener("click", (e) => {
      const card = e.target.closest("article.card[data-id]");
      if (!card) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.target.closest("a[href]")) return;
      e.preventDefault();
      goCard(card);
    });

    grid.addEventListener("keydown", (e) => {
      const card = e.target.closest("article.card[data-id]");
      if (!card || e.target !== card) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      goCard(card);
    });
  }

  const CARD_SIZES = "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw";

  function cardMedia(c) {
    const alt = `${escapeHtml(c.title)} — интерьер`;
    const webpSource = c.coverWebpSrcset
      ? `<source type="image/webp" srcset="${escapeHtml(c.coverWebpSrcset)}" sizes="${CARD_SIZES}" />`
      : "";
    const imgSrcset = c.coverSrcset
      ? ` srcset="${escapeHtml(c.coverSrcset)}" sizes="${CARD_SIZES}"`
      : "";
    const img = `<img src="${escapeHtml(c.cover)}"${imgSrcset} alt="${alt}" width="600" height="450" loading="lazy" decoding="async" />`;
    return webpSource ? `<picture>${webpSource}${img}</picture>` : img;
  }

  function pairBranchLabel(c) {
    if (c.branch === "design") return BRANCHES.repair.cardLabel;
    if (c.branch === "repair") return BRANCHES.design.cardLabel;
    return "";
  }

  function cardTopline(c, branchLabel) {
    const branch = `<p class="card__branch">${escapeHtml(branchLabel)}</p>`;
    if (!c.pairId) return branch;

    const pairLabel = pairBranchLabel(c);
    if (!pairLabel) return branch;

    const pairLink = `<a class="card__branch-link" href="${caseHref(c.pairId)}">${escapeHtml(pairLabel)}</a>`;
    return `${branch}${pairLink}`;
  }

  function renderCards(list) {
    const grid = document.getElementById("case-grid");
    if (!grid) return;

    if (!list.length) {
      grid.innerHTML =
        '<p class="empty-state">Нет объектов по выбранным фильтрам. Сбросьте ЖК или площадь.</p>';
      return;
    }

    const meta = branchMeta(state.branch);
    const branchLabel = meta ? meta.cardLabel || meta.label : "";

    grid.innerHTML = list
      .map(
        (c) => `
      <article class="card" data-id="${escapeHtml(c.id)}" tabindex="0" role="link" aria-label="Смотреть кейс: ${escapeHtml(c.title)}">
        <div class="card__media">
          ${cardMedia(c)}
        </div>
        <div class="card__body">
          <div class="card__topline">
            ${cardTopline(c, branchLabel)}
          </div>
          <h3 class="card__title">${escapeHtml(c.complex || c.title)}</h3>
          <p class="card__meta">${escapeHtml(c.areaLabel)}${c.roomsLabel ? ` · ${escapeHtml(c.roomsLabel)}` : ""}</p>
          <span class="btn btn--primary">Смотреть объект</span>
        </div>
      </article>
    `
      )
      .join("");

    bindCardNavigation(grid);
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s == null ? "" : String(s);
    return div.innerHTML;
  }

  function bindChipRow(row, getValue, setValue) {
    if (!row) return;
    row.querySelectorAll(".chip[data-value]").forEach((chip) => {
      chip.addEventListener("click", () => {
        setValue(chip.getAttribute("data-value") || "");
        setActiveChip(row, getValue());
        applyFilters();
      });
    });
  }

  function syncFilterToggle() {
    const toggle = document.getElementById("filter-toggle");
    const panel = document.getElementById("filter-panel");
    if (!toggle || !panel) return;
    const open = !panel.hidden;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.classList.toggle("is-open", open);
  }

  function initFilterToggle() {
    const toggle = document.getElementById("filter-toggle");
    const panel = document.getElementById("filter-panel");
    if (!toggle || !panel || toggle.dataset.bound === "1") return;
    toggle.dataset.bound = "1";
    toggle.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      syncFilterToggle();
    });
    syncFilterToggle();
  }

  function initFilters() {
    state.complex = readComplexFromUrl();
    state.area = readAreaFromUrl();

    const complexes = complexesForBranch();
    const complexRow = document.getElementById("filter-complex");
    if (complexRow) {
      complexRow.innerHTML =
        '<button type="button" class="chip" data-value="" aria-pressed="false">Все ЖК</button>' +
        complexes
          .map(
            (x) =>
              `<button type="button" class="chip" data-value="${escapeHtml(x)}" aria-pressed="false">${escapeHtml(x)}</button>`
          )
          .join("");
      setActiveChip(complexRow, state.complex);
      bindChipRow(
        complexRow,
        () => state.complex,
        (v) => {
          state.complex = v;
        }
      );
    }

    const areaRow = document.getElementById("filter-area");
    if (areaRow) {
      areaRow.innerHTML = AREA_BANDS.map(
        (b) =>
          `<button type="button" class="chip" data-value="${escapeHtml(b.id)}" aria-pressed="false">${escapeHtml(b.label)}</button>`
      ).join("");
      setActiveChip(areaRow, state.area);
      bindChipRow(
        areaRow,
        () => state.area,
        (v) => {
          state.area = v;
        }
      );
    }

    initFilterToggle();
  }

  function setNavBranchActive() {
    document.querySelectorAll("[data-branch-nav]").forEach((el) => {
      const id = el.getAttribute("data-branch-nav") || "";
      const on = Boolean(state.branch) && id === state.branch;
      el.classList.toggle("is-active", on);
      if (on) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
  }

  function showGate() {
    const gate = document.getElementById("gate");
    const catalog = document.getElementById("catalog-view");
    if (gate) gate.hidden = false;
    if (catalog) catalog.hidden = true;
    document.title = "Каталог объектов | РеНова+ · Уфа";
  }

  function showCatalog() {
    const gate = document.getElementById("gate");
    const catalog = document.getElementById("catalog-view");
    if (gate) gate.hidden = true;
    if (catalog) catalog.hidden = false;

    const meta = branchMeta(state.branch);
    const titleEl = document.getElementById("branch-title");
    if (titleEl && meta) titleEl.textContent = meta.label;
    document.title = `${meta ? meta.label + " · " : ""}Каталог | РеНова+`;

    initFilters();
    applyFilters();
    setNavBranchActive();
  }

  function render() {
    state.branch = readBranchFromUrl();
    setNavBranchActive();
    if (!state.branch) {
      showGate();
      syncFiltersToUrl();
      return;
    }
    showCatalog();
  }

  function isCatalogHome() {
    return Boolean(document.getElementById("gate") && document.getElementById("catalog-view"));
  }

  /** Same-page branch switch (gate + header) — works without full reload. */
  function bindBranchNavigation() {
    if (!isCatalogHome()) return;
    document.addEventListener("click", (e) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = e.target.closest("a[href]");
      if (!link) return;

      const raw = link.getAttribute("href") || "";
      if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) {
        return;
      }
      if (/^(https?:)?\/\//i.test(raw) && !raw.includes(window.location.host)) return;
      if (/(contacts|privacy|cases\/|tips)/i.test(raw)) return;

      let url;
      try {
        url = new URL(raw, window.location.href);
      } catch {
        return;
      }

      const branch = url.searchParams.get(BRANCH_PARAM) || "";
      if (!branchMeta(branch)) return;

      // Only intercept links that stay on this catalog index document.
      const targetPath = url.pathname.replace(/\\/g, "/");
      const herePath = window.location.pathname.replace(/\\/g, "/");
      const targetsIndex =
        raw.startsWith("?") ||
        /(^|\/)index\.html$/i.test(targetPath) ||
        targetPath === herePath ||
        targetPath.endsWith("/");
      if (!targetsIndex) return;

      e.preventDefault();
      const next = new URL(window.location.href);
      next.searchParams.set(BRANCH_PARAM, branch);
      if (url.searchParams.has(COMPLEX_PARAM)) {
        next.searchParams.set(COMPLEX_PARAM, url.searchParams.get(COMPLEX_PARAM) || "");
      } else {
        next.searchParams.delete(COMPLEX_PARAM);
      }
      if (url.searchParams.has(AREA_PARAM)) {
        next.searchParams.set(AREA_PARAM, url.searchParams.get(AREA_PARAM) || "");
      } else {
        next.searchParams.delete(AREA_PARAM);
      }
      history.pushState(null, "", next);
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindBranchNavigation();
    render();
  });
  window.addEventListener("popstate", render);
})();
