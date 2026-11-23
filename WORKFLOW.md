# Регламент (черновик до появления кода)

## 0) До старта разработки

1. Зафиксировать ответ клиента и статус сделки в `CLIENT.md` + трекере продаж.
2. Утвердить стек в `docs/stack-choice.md`.
3. Получить комплект: логотип, цвета, CTA, список объектов, фото.
4. Склонировать/скопировать каркас кода из выбранного референса **в эту папку** (или новый git remote) — отдельным чатом `implement`.

## 1) Новый кейс (целевой процесс ≈ За Комфортом)

```powershell
# после появления scripts/
python scripts/scaffold-case.py --title "ЖК …" --address "Уфа, …"
# исходники → inbox/<slug>/
python scripts/process-assets.py --case <id> --from inbox/<slug>/
# правки content/cases/<id>.json
python scripts/build-pages.py
python scripts/validate-cases.py
```

Если стек = Ellis:

- one-shot jpeg-fit в `web/public/cases/...`
- запись в `cases.ts` (newest first)
- job в `copy-assets.mjs`
- не гонять полный batch без нужды

## 2) Перед публикацией

- Карточка и страница кейса открываются, медиа не битые.
- CTA ведут на телефоны/мессенджеры РеНова+ (не на чужие демо).
- Публичный деплой — только allowlist (урок За Комфортом).
- Метрика/цели — после выдачи ID от клиента.

## 3) Чеклист материалов от клиента

См. `docs/materials-checklist.md`.
