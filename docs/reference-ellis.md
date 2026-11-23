# Референс: Каталог Ellis

Локально: `c:\Users\Пользователь\Desktop\Coursor\Каталог Ellis`  
Репозиторий: https://github.com/MaksimRafikov/ellis-catalog  
Демо: https://ellis-catalog.vercel.app/

## Зачем смотреть

Ellis — второй живой демо-кейс в cold email (дизайн **и** ремонт, десятки объектов). Ближе, если у РеНова+ нужна **двухветковая** IA (дизайн / ремонт) и сильный брендовый UI, а не только «фильтр по ЖК».

## Стек

| Слой | Решение |
| --- | --- |
| Фреймворк | Next.js App Router (`web/`), React 19, TypeScript |
| Стили | Tailwind CSS v4 + CSS-токены в `globals.css` |
| Данные | один файл `web/src/data/cases.ts` (`designCases` / `renovationCases`) |
| Медиа | `web/public/cases/...`; архив исходников `Наполнение сайта/` (gitignore) |
| Импорт фото | `scripts/copy-assets.mjs` + `scripts/lib/jpeg-fit.mjs` (max-edge 1920, q≈80) |
| Видео | `scripts/import-review-videos.mjs` |
| Деплой | Vercel (ellis-catalog) |
| Агент-протокол | `STATUS.md` Handoff, `NEW_CHAT_PLAYBOOK.md`, `.ecc/session/atoms.md`, `.cursor/rules/*` |

## IA (информационная архитектура)

```
Home → Design | Renovation → Catalog (apartments / houses) → Case → Contacts CTA
         ↕ cross-link design ↔ renovation при связке кейсов
```

- Главная: бренд Ellis доминирует, 2 CTA (Дизайн / Ремонт), full-bleed фото, без стат-чипов.
- Фильтры: design apartments — площадь; renovation — designer / complex; houses — без лишних чипов.
- Карточка: обложка, площадь, style plate; галерея + план + PDF + видео отзыва.
- UX-детали: lightbox с жестами, FloatingBack, mobile open affordance, PDF CTA.

## Дизайн-контракт (что перенимать осторожно)

- Cool stone + один oxidized copper accent; Source Serif 4 + IBM Plex Sans.
- Не копировать «Ellis look» один в один на РеНова+ — у клиента другой тон (масс/комфорт «под ключ», пакеты Смарт/Комфорт).
- Перенимать: photo-first, cards только вокруг клика, фильтры ink/line, caption plate, kill-ai-slop.

## Пайплайн контента

1. Исходники в архиве `Наполнение сайта/`.
2. One-shot или batch → `web/public/cases/<slug>/` через jpeg-fit.
3. Запись в `cases.ts` (**newest first** — unshift в начало массива).
4. Регистрация джоба в `copy-assets.mjs` для будущих rebuild.
5. Git: не коммитить full-res; история уже чистилась от тяжёлых JPG.

## Правила / фазы агента

- Фазы: `direction` → `content` → `implement` → `visual-qa` → `copy` → `ship`.
- Один чат = одна фаза (кроме implement+visual-qa одной поверхности).
- Skills: `frontend-design-direction`, `make-interfaces-feel-better`, `kill-ai-slop`.
- Тяжёлое наружу: полный `copy-assets`, `npm run build`, полная Playwright-матрица.

## Что уже доказано на проде (полезные паттерны)

- Dual catalog + cross-link.
- URL-синк фильтров (`useCatalogFilterParams`).
- Lightbox a11y + mobile gestures.
- Contacts с реальными телефонами менеджеров.
- Fixed back-кнопка для навигации по глубоким страницам.
- Security: CSP/XFO headers, Dependabot, private repo.

## Когда выбирать Ellis-подобный стек для РеНова+

- Нужен App Router, SSR/SEO-роуты, Vercel.
- Сложная IA (дизайн/ремонт/типы объектов) и кастомный luxury UI.
- Команда/агент уже живут в Next+TS (как Ellis).

## Когда не тащить Ellis целиком

- Клиенту достаточно каталога ремонтов с фильтром ЖК (ближе к За Комфортом).
- Бюджет/срок 14 дней на пакет 25 кейсов — static HTML пайплайн быстрее клонировать и наполнить.
- Tilda-сайт остаётся маркетингом; каталог = отдельный инструмент встреч.
