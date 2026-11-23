(function () {
  const cfg = () => window.ZK_CONFIG || {};

  function esc(s) {
    const div = document.createElement("div");
    div.textContent = s == null ? "" : String(s);
    return div.innerHTML;
  }

  function ensureModal() {
    let root = document.getElementById("lead-modal");
    if (root) return root;

    const phone = cfg().phone || "+7 (917) 770-90-99";
    const phoneHref = cfg().phoneHref || "+79177709099";
    const email = cfg().email || "renovaufa@yandex.ru";
    const whatsapp = cfg().whatsapp || "https://wa.me/79177709099";
    const ctaLabel = cfg().ctaPrimaryLabel || "Позвонить менеджеру";

    root = document.createElement("div");
    root.id = "lead-modal";
    root.className = "lead-modal";
    root.hidden = true;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "lead-modal-title");
    root.innerHTML = `
      <div class="lead-modal__backdrop" data-lead-close tabindex="-1"></div>
      <div class="lead-modal__panel">
        <button type="button" class="lead-modal__close" data-lead-close aria-label="Закрыть">&times;</button>
        <h2 id="lead-modal-title" class="lead-modal__title">Оставить заявку</h2>
        <p class="lead-modal__lead">Коротко опишите запрос — отправим на почту или в WhatsApp.</p>
        <form class="lead-form" id="lead-form" novalidate>
          <label class="lead-form__field">
            <span>Имя</span>
            <input type="text" name="name" autocomplete="name" required />
          </label>
          <label class="lead-form__field">
            <span>Телефон</span>
            <input type="tel" name="phone" autocomplete="tel" inputmode="tel" enterkeyhint="next" placeholder="+7 …" required />
          </label>
          <label class="lead-form__field">
            <span>Комментарий</span>
            <textarea name="comment" rows="3" placeholder="Интересует похожий на …"></textarea>
          </label>
          <div class="lead-form__actions">
            <button type="submit" class="btn btn--primary" data-channel="email">На почту</button>
            <button type="submit" class="btn btn--ghost" data-channel="whatsapp">В WhatsApp</button>
          </div>
        </form>
        <p class="lead-modal__alt">
          <a href="tel:${esc(phoneHref)}">${esc(ctaLabel)}</a>
          <span aria-hidden="true"> · </span>
          <a href="tel:${esc(phoneHref)}">${esc(phone)}</a>
          <span aria-hidden="true"> · </span>
          <a href="mailto:${esc(email)}">${esc(email)}</a>
        </p>
      </div>
    `;
    root.dataset.whatsapp = whatsapp;
    document.body.appendChild(root);
    bindModal(root);
    return root;
  }

  function buildMessage(form) {
    const name = (form.name.value || "").trim();
    const phone = (form.phone.value || "").trim();
    const comment = (form.comment.value || "").trim();
    const caseHint = document.body.dataset.caseTitle
      ? `\nОбъект: ${document.body.dataset.caseTitle}`
      : "";
    return [
      "Заявка с каталога РеНова+",
      `Имя: ${name || "—"}`,
      `Телефон: ${phone || "—"}`,
      comment ? `Комментарий: ${comment}` : null,
      caseHint.trim() || null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  function openWhatsApp(text) {
    const base = (cfg().whatsapp || "https://wa.me/79177709099").replace(/\?.*$/, "");
    const url = `${base}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openMailto(text) {
    const email = cfg().email || "renovaufa@yandex.ru";
    const subject = encodeURIComponent("Заявка с каталога РеНова+");
    const body = encodeURIComponent(text);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  function openModal() {
    const root = ensureModal();
    root.hidden = false;
    document.body.style.overflow = "hidden";
    const first = root.querySelector("#lead-form input");
    if (first) first.focus();
  }

  function closeModal() {
    const root = document.getElementById("lead-modal");
    if (!root) return;
    root.hidden = true;
    document.body.style.overflow = "";
  }

  function bindModal(root) {
    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-lead-close]")) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !root.hidden) closeModal();
    });

    const form = root.querySelector("#lead-form");
    let channel = "email";
    form.querySelectorAll("[data-channel]").forEach((btn) => {
      btn.addEventListener("click", () => {
        channel = btn.getAttribute("data-channel") || "email";
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const text = buildMessage(form);
      if (channel === "whatsapp") openWhatsApp(text);
      else openMailto(text);
      closeModal();
    });
  }

  function bindTriggers() {
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-open-lead], .js-open-lead");
      if (!trigger) return;
      e.preventDefault();
      openModal();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureModal();
    bindTriggers();
  });

  window.RenovaLead = { open: openModal, close: closeModal };
})();
