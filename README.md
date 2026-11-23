# Каталог РеНова+

Рабочая папка каталога объектов для **РеНова+** (Уфа, ремонт + дизайн).  
Стек: **static HTML/CSS/JS + Python** (пайплайн как у За Комфортом).

## Быстрый старт для агента / нового чата

1. `STATUS.md` → `## Handoff`
2. `CLIENT.md`
3. `.ecc/session/atoms.md`
4. `docs/stack-choice.md`, `docs/design-tokens.md`

Шаблоны чатов: `NEW_CHAT_PLAYBOOK.md`.

## Локальный просмотр

```bash
python scripts/build-pages.py
python -m http.server 8765
# http://127.0.0.1:8765/
```

## Документы

| Путь | Содержание |
| --- | --- |
| [CLIENT.md](CLIENT.md) | Досье клиента, CTA, аванс |
| [docs/stack-choice.md](docs/stack-choice.md) | Утверждённый стек |
| [docs/design-tokens.md](docs/design-tokens.md) | Цвета бренда |
| [docs/materials-checklist.md](docs/materials-checklist.md) | Что запросить у клиента |
| [content/site.json](content/site.json) | Контакты / CTA |

## Структура

```
inbox/            сырьё от клиента
assets/           продакшен-медиа (+ brand/)
content/cases/    JSON кейсов
scripts/          scaffold / process / build / validate / export
css/ js/ cases/   статический фронт
docs/             бриф и референсы
```

## Не делать без запроса

- Полный медиа-batch / деплой / DNS до комплекта.
- Копировать бренд/тексты/метрику За Комфортом или Ellis.
