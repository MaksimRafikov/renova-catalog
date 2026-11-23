# UI-pass из рилсов (2026-11-20)

Источник: разбор 4 рилсов (maksat.up / vaykord / yelisey / web_balash) + аудио.  
Назначение: полировка каталога РеНова+ и переиспользование в других UI-проектах.

## Брать всегда

1. **Анти-AI-slop:** единые отступы/радиусы, свой бренд-цвет (не purple gradient), контраст, hit areas.
2. **Скиллы (по желанию агента):** Jakub Krehel — `npx skills add jakubkrehel/skills` (`/interface-review`, `/better-ui`, typography, colors, a11y, `/variant`). Motion — Emil Kowalski: `npx skills@latest add emilkowalski/skills`.
3. **Анимации (Kowalski):**
   - появление: `ease-out` (быстрый старт → плавное торможение);
   - UI ≤ ~300 ms: клик ~150 ms, меню/панель ~150–250 ms;
   - модалки/оверлеи: enter с ~95% scale, не из 0;
   - кнопка `:active` ~ scale(0.97);
   - то, что пользователь видит постоянно (сетка карточек, скролл) — не анимировать.
4. **Формы:** лейбл **над** полем (не floating label); высота поля/кнопки ~48–56 px; ровный ритм отступов; удобный paste телефона; единый radius с кнопками/модалкой.
5. **Галереи-референсы (только паттерн, не клон):** `cta.gallery`, `footer.design`. SaaS hero/pricing — не для каталога встреч.

## Не брать в лоб

- Floating labels + pill `border-radius: 99px` только на инпутах (web_balash) — спорно по a11y; у РеНова+ лейбл сверху.
- Копировать чужие hero/pricing/бренды.
- Анимировать каждую карточку каталога «ради красоты».

## РеНова+ — конкретный чеклист

- [x] Согласовать шкалу `--radius` / отступы (`--radius-xs/sm/lg/pill`, `--control-h`, `--motion-*`).
- [x] Lead-modal: touch-высота полей, лейблы сверху, `:active` на CTA.
- [x] Модалка + панель фильтра: enter ease-out + ~95% scale (`ui-enter`, ~200 ms).
- [x] Кнопки «Позвонить» / gate / фильтр: press feedback (`scale(0.97)`).
- [x] Прогон kill-ai-slop + короткий interface-review по index / case / contacts.
- [x] Не трогать content-prep / деплой / DNS в этом проходе.

Сырьё кадров/транскриптов (локально): `.ecc/session/offload/reels/`.
