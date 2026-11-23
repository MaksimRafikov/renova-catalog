# Выбор стека для РеНова+

## Решение (утверждено)

**База = За Комфортом: static HTML/CSS/JS + Python pipeline.**

Зафиксировано на фазе scaffold (2026-11-16): пайплайн скопирован в этот репозиторий, бренд/метрика/tips За Комфортом вычищены. Ellis остаётся **UX-референсом** (photo-first, фильтры, lightbox later) — без клонирования визуала и без Next.js.

## Краткая матрица

| Критерий | За Комфортом (static) | Ellis (Next.js) |
| --- | --- | --- |
| Скорость клонирования пайплайна | выше (Python + JSON) | ниже (Next + TS + Tailwind) |
| Фильтр ЖК «из коробки» | да, ядро продукта | да, но IA шире |
| Dual design↔repair | слабо | сильная сторона |
| Деплой | GitHub Pages allowlist | Vercel |
| Медиа-пайплайн | process-assets (1440 + WebP) | jpeg-fit 1920 + copy-assets |
| Близость к хуку письма РеНова+ | **высокая** | средняя |

## Почему static

1. Боль клиента = карусель Tilda без фильтра ЖК / площади — задача static-каталога.
2. Пакет до 25 кейсов / 14 дней от полного комплекта: быстрее JSON + assets.
3. Основной сайт остаётся на Tilda; каталог — инструмент встреч (поддомен позже).
4. Ellis — референс UX (lightbox, caption plate, FloatingBack), не стек.

## Что берём

Из **За Комфортом**: `inbox/` → `assets/` → `content/cases/`, scaffold / process / build / validate / export, `site.json`, фильтр ЖК (+ площадь в UI-заготовке).

Из **Ellis**: photo-first тон, a11y lightbox later, mobile affordances, newest-first, kill-ai-slop.

## Что не копируем

- Бренд-цвет `#1f5f4e`, лого, тексты, tips, метрику, CTA За Комфортом.
- Визуал / тексты Ellis.

## Статус

- **Утверждено:** static (За Комфортом pipeline).
- Токены бренда: `docs/design-tokens.md`.
