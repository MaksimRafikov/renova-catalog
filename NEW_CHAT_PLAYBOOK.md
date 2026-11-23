# New chat playbook — РеНова+

Короткие чаты по фазам. Состояние: `STATUS.md` → `## Handoff`. Атомы: `.ecc/session/atoms.md`.

Пока код не подключён — фазы `direction` / `kickoff` / `content-prep`. После выбора стека фазы совпадают с референсом (За Комфортом **или** Ellis).

## Карта фаз (до кода)

| Фаза | Делать | Не делать |
| --- | --- | --- |
| `kickoff` | Досье, бриф, стек, чеклист материалов | Писать UI |
| `direction` | Тон/IA/токены под бренд РеНова+ | Копировать Ellis/За Комфортом 1:1 |
| `content-prep` | Принять inbox, список объектов, нормализовать названия ЖК | Сборка всего каталога «заодно» |

## Карта фаз (после выбора стека)

Если **static / За Комфортом** — как в том репо: `content` → `implement` → `visual-qa` → `ship` (`build-pages` + `validate-cases` + export).

Если **Next / Ellis** — как в Ellis: `direction` → `content` → `implement` → `visual-qa` → `copy` → `ship`.

Смена фазы: обновить Handoff (+ atoms) → новый чат.

## Старт любого чата

```
Прочитай только STATUS.md → ## Handoff, CLIENT.md и .ecc/session/atoms.md.
Фаза: <phase>. Не читай целиком референс-репозитории и галереи без нужды.
```

## Шаблоны

### kickoff / бриф

```
Прочитай STATUS.md → ## Handoff и CLIENT.md.
Фаза: kickoff. Обновить: ответ клиента / объём кейсов / домен / контакты CTA.
При необходимости сверь docs/stack-choice.md. Код не писать.
```

### direction

```
Прочитай STATUS.md → ## Handoff, CLIENT.md и docs/stack-choice.md.
Фаза: direction. Поверхность: <hero | catalog | case>.
Короткий дизайн-бриф под РеНова+ (не клон Ellis). Код не писать.
```

### content-prep

```
Прочитай STATUS.md → ## Handoff.
Фаза: content-prep. Материалы: inbox/<slug> или список от клиента.
Нормализовать ЖК/м²/пакет; записать чеклист в docs/. UI не трогать.
```

### implement (после появления кода)

```
Прочитай STATUS.md → ## Handoff и файлы: <paths>.
Фаза: implement. Сделать: <одно изменение>.
После кода — smoke одной страницы.
```
