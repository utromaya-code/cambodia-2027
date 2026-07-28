# Камбоджа: Дорога на юг

Лендинг авторского путешествия по Камбодже, 26 февраля — 8 марта 2027.
Один маршрут, два способа пройти его — на байке (€2 200) или на микроавтобусе
(€2 000), плюс отдельная программа на острове Ко Ронг 8–15 марта.

Astro + TypeScript, статическая сборка, деплой на GitHub Pages.

Две страницы:

| Адрес | Что это |
| --- | --- |
| `/` | Путешествие «Камбоджа: Дорога на юг» |
| `/island` | Островная программа на Ко Ронге, 8–15 марта |

Обе собираются из одних и тех же данных: секция острова на главной и
страница `/island` читают `src/data/island.ts`, поэтому текст правится
в одном месте.

---

## Быстрый старт

```bash
npm install
npm run dev        # http://localhost:4321/cambodia-2027
```

| Команда | Что делает |
| --- | --- |
| `npm run dev` | Дев-сервер с горячей перезагрузкой |
| `npm run build` | Продакшен-сборка в `dist/` |
| `npm run preview` | Локальный просмотр собранного сайта |
| `npm run typecheck` | Проверка типов (`astro check`) |

Нужен Node 22 или новее.

---

## Где лежит контент

Тексты не зашиты в компоненты — всё в `src/data/`:

| Файл | Что внутри |
| --- | --- |
| `trip.ts` | Даты, города, первый экран, блок «на десять дней можно уехать» |
| `route.ts` | Десять точек маршрута с координатами |
| `days.ts` | Программа по дням |
| `sections.ts` | «Зачем Камбоджа», уникальность, практики, для кого, проживание |
| `pricing.ts` | Два варианта участия, блоки «почему на байке» и «не ездишь на мотоцикле» |
| `bike.ts` | Royal Enfield Scram 411 и поля блока безопасности |
| `island.ts` | Программа на Ко Ронге: секция на главной и вся страница `/island` |
| `leaders.ts` | Ведущие |
| `faq.ts` | Вопросы и ответы |
| `credits.json` | Авторство фотографий (создаётся скриптом) |

Правка текста — это правка файла в `src/data/`. Вёрстку трогать не нужно.

### Неподтверждённые данные

Часть фактов пока не подтверждена организатором. Такие поля помечены
значением `TODO_CONTENT` из `src/data/content.ts`, а секции, которые без них
превратились бы в обещание, выключены флагами:

```ts
export const featureFlags = {
  includedExcluded: false,  // «Что входит в стоимость»
  motorcycleSpecs: false,   // требования к опыту, депозит, сопровождение
  namedHotels: false,       // конкретные отели
};
```

Когда данные появятся — заполните поле и переключите флаг в `true`.
Полный список недостающего: **[CONTENT_NEEDED.md](CONTENT_NEEDED.md)**.

---

## Фотографии

Снимки лежат в `src/assets/photos/`. Имя файла без расширения — это ключ,
по которому изображение подставляется из данных (`image: 'bokor'` →
`src/assets/photos/bokor.jpg`). Astro сам делает WebP, срезы под разные
экраны и ленивую загрузку.

### Заменить фотографию

Положите свой файл под тем же именем — и всё:

```bash
cp ~/my-bokor-photo.jpg src/assets/photos/bokor.jpg
npm run build
```

Если снимка нет, на его месте появляется честная заглушка «Фотография будет
добавлена» — страница не ломается.

### Откуда взяты текущие снимки

Все — из Wikimedia Commons под лицензиями, разрешающими коммерческое
использование (CC0, CC BY, CC BY-SA). Автор, лицензия и ссылка на оригинал
для каждого хранятся в `src/data/credits.json` и выводятся в подвале сайта.

**Заменяя фотографию на свою, удалите её запись из `credits.json`** — иначе
в подвале останется указание на чужое авторство.

Скрипты подбора (нужны только при поиске новых снимков):

```bash
python3 scripts/search_commons.py     # найти кандидатов -> commons.json
node scripts/contact_sheets.mjs       # контактные листы -> .tmp/sheets/
node scripts/fetch_selected.mjs       # скачать выбранное по picks.json
```

---

## Ведущие

`src/data/leaders.ts`. Для каждого: `name`, `role`, `shortBio`, `portrait`.

Портрет — ключ файла в `src/assets/photos/`. Чтобы добавить недостающего
ведущего:

1. положите портрет, например `src/assets/photos/leader-leonid.jpg`;
2. в `leaders.ts` замените `TODO_CONTENT` на реальные значения:

```ts
{
  id: 'leonid-kutuzov',
  name: 'Леонид Кутузов',
  role: 'Дорога',
  shortBio: '…',
  portrait: 'leader-leonid',
}
```

Пока стоит `TODO_CONTENT`, карточка показывает инициал вместо фото и строку
«Расскажем подробнее ближе к старту» вместо био.

---

## Приём заявок

Форма отправляет JSON методом POST на адрес из переменной окружения
`PUBLIC_LEAD_WEBHOOK_URL`.

```bash
# .env
PUBLIC_LEAD_WEBHOOK_URL="https://example.com/hook"
```

Формат заявки — интерфейс `Lead` в `src/scripts/lead.ts`:

```json
{
  "name": "Имя",
  "contact": "@username",
  "email": "mail@example.com",
  "mode": "motorcycle | road | unsure",
  "island": "yes | no | unsure",
  "comment": "…",
  "page": "https://…",
  "referrer": "https://…"
}
```

Если переменная не задана, форма **не ломается**: в разработке пишет заявку
в консоль и показывает успех, в продакшене предлагает написать в Telegram.

Подключить Telegram-бота, GetCourse, Google Sheet или CRM можно, поменяв
только адрес вебхука — разметку и логику формы трогать не нужно. Ключи и
токены на фронтенде не хранятся: приёмник сам решает, что делать с заявкой.

На GitHub Pages переменная задаётся секретом репозитория
`PUBLIC_LEAD_WEBHOOK_URL` (Settings → Secrets and variables → Actions).

---

## Аналитика

События собираются в `src/scripts/analytics.ts` и уходят в `dataLayer` /
`gtag`, если счётчик подключён. Сам по себе никакой внешний трекер не
загружается.

События: `hero_cta_click`, `route_cta_click`, `bike_price_cta`,
`van_price_cta`, `retreat_cta`, `lead_form_open`, `lead_form_submit`,
`leader_click`, `route_day_open`.

Чтобы подключить счётчик, добавьте его код в `src/layouts/Base.astro`.

---

## Карта маршрута

Контур Камбоджи — из Natural Earth (public domain), пересчитан в SVG-путь
скриптом и сохранён в `src/data/cambodia-shape.ts`. В зависимостях сайта
картографии нет.

Если поменяете границы карты (`mapBounds` в `src/data/route.ts`), пересчитайте
контур:

```bash
npm install --no-save world-atlas@2 topojson-client@3
node scripts/build_map.mjs
```

Подписи точек на юге и у Ангкора стоят плотно, поэтому их положение задано
вручную в таблице `labelOffsets` в `src/components/RouteMap.astro`.

---

## Деплой

GitHub Actions собирает и публикует сайт при каждом пуше в `main` или в
рабочую ветку (`.github/workflows/deploy.yml`).

Включить один раз: Settings → Pages → Source: **GitHub Actions**.

### Домен

По умолчанию сайт живёт на GitHub Pages в подкаталоге. Адрес и базовый путь
берутся из переменных окружения:

| Переменная | По умолчанию | Для своего домена |
| --- | --- | --- |
| `SITE_URL` | `https://utromaya-code.github.io` | `https://cambodia2027.ru` |
| `BASE_PATH` | `/cambodia-2027` | `/` |

Чтобы подключить домен:

1. Settings → Pages → Custom domain — вписать домен;
2. в DNS добавить `CNAME` на `utromaya-code.github.io`;
3. Settings → Secrets and variables → Actions → Variables — задать
   `SITE_URL` и `BASE_PATH` из правой колонки;
4. запустить сборку заново.

От этих переменных зависят canonical, OpenGraph и `sitemap.xml`, поэтому
менять их нужно именно так, а не правкой разметки. После смены домена
поправьте адрес карты сайта в `public/robots.txt`.

---

## Проверка перед публикацией

```bash
npm run typecheck
npm run build
npm run preview &

# главная и страница острова проверяются отдельно
node scripts/screenshots.mjs
node scripts/screenshots.mjs http://localhost:4321/cambodia-2027/island
```

`scripts/screenshots.mjs` снимает страницу на 375/390/430/768/1440 и заодно
проверяет: горизонтальную прокрутку (с указанием виноватого элемента), битые
якорные ссылки, `alt` у изображений, работу аккордеонов с клавиатуры, ошибки
в консоли и то, что после прокрутки не осталось непроявившихся блоков.
Скриншоты складываются в `.tmp/shots/`.

---

## Структура

```
src/
  data/         контент и данные
  components/   секции страницы
  layouts/      Base.astro — «шапка» документа, SEO, schema.org
  pages/        index.astro — сборка страницы
  scripts/      отправка заявки, аналитика
  styles/       global.css — палитра, типографика, раскладка
  assets/photos фотографии
scripts/        вспомогательные скрипты (карта, подбор фото, скриншоты)
public/         robots.txt, og-image.jpg
```

Секцию острова можно вынести на отдельную страницу `/island`, не переписывая
тексты: весь её контент лежит в `src/data/island.ts`, а `Island.astro` —
только его отображение.
