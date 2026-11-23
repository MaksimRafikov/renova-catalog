# Референс: Каталог работ ЗА КОМФОРТОМ

Локально: `c:\Users\Пользователь\Desktop\Coursor\Каталог работ ЗА КОМФОРТОМ`  
Репозиторий: https://github.com/MaksimRafikov/ZaKomfort  
Демо: https://katalog.zakomfortom.com/

## Зачем смотреть

Ближайший продуктовый аналог для РеНова+: каталог **реальных ремонтов** под продажи на встрече, фильтр по **ЖК**, фото / план / видео, статическая выдача, отдельный публичный деплой.

## Стек

| Слой | Решение |
| --- | --- |
| Фронт | статический HTML/CSS/JS (без Next/фреймворков) |
| Данные | `content/cases/<id>.json` + `content/site.json` |
| Сборка | `python scripts/build-pages.py` → `js/data.js`, `cases/<slug>/`, sitemap, `?v=` cache bust |
| Валидация | `python scripts/validate-cases.py` |
| Медиа | `inbox/<slug>/` → `process-assets.py` → `assets/<id>/` (мастер 1440px + 640/1024 + WebP) |
| Видео tips | `process-videos.py` → `assets/tips/` + `js/tips-data.js` |
| Публичный деплой | `export-public-site.py` → `_site/` → GitHub Actions Pages (allowlist) |
| Аналитика | Яндекс.Метрика (`metrikaId` в site.json) + цели CTA |
| Агент | `STATUS.md`, `NEW_CHAT_PLAYBOOK.md`, `.cursor/rules/catalog-*.mdc` |

## IA

```
index (каталог + фильтр ЖК) → cases/<slug>/ → CTA (звонок / WhatsApp / Telegram / Max / VK / quiz)
опционально: tips/<slug>/ (советы эксперта / видео)
```

Жёсткие продуктовые запреты (из playbook За Комфортом) — учитывать при брифе РеНова+:

- не плодить фильтры сверх ЖК без запроса;
- без цен на сайте;
- без водяных знаков / тяжёлых DOM-щитов;
- подписи фото — название объекта, не спам по комнатам;
- без before/after-слайдера «для красоты».

## Пайплайн нового кейса

1. `python scripts/scaffold-case.py --title "..." --address "..."`
2. Класть исходники в `inbox/<slug>/`
3. `python scripts/process-assets.py --case <id> --from inbox/<slug>/...`
4. Править только `content/cases/<id>.json` (cover/gallery = мастер-файлы)
5. `build-pages.py` + `validate-cases.py`
6. Перед продом: `export-public-site.py` (в `_site` не должны утекать scripts/content/docs)

## Схема кейса (поля, которые живут в JSON)

Минимум из боевых кейсов: `id`, `title`, `address`, `areaSqm`, `complex` (ЖК), `cover`, `gallery[]`, `plan?`, `hasVideo`, `summary`, `format`, `style`, `highlights`, `workList`, CTA через site.json.

Пример эталона: `content/cases/green-park-93.json`.

## site.json — бренд/контакты

Телефон, WhatsApp, Telegram, Max, VK, 2ГИС, logo, ogImage, metrikaId, ссылки на основной сайт и квиз. Для РеНова+ стартовый черновик лежит в `content/site.json` этой папки.

## Публичная безопасность деплоя

Урок За Комфортом: не публиковать весь git root на Pages. Только allowlist `_site/`. Подробности: `docs/public-deploy.md` в том репо.

## Когда выбирать этот стек для РеНова+

- Каталог = инструмент встреч поверх существующего Tilda-сайта.
- Главный фильтр — ЖК (как в хуке письма).
- Нужен предсказуемый Python-пайплайн медиа + быстрый наполняемый JSON.
- Деплой на GitHub Pages / поддомен.

## Что не копировать слепо

- Бренд-цвет `#1f5f4e`, логотип, тексты, tips-контент За Комфортом.
- Метрику и чужие CTA-ссылки.
- Запреты фильтров — у РеНова+ могут понадобиться пакеты Смарт/Комфорт (согласовать в брифе).
