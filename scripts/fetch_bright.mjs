/**
 * Скачивает отобранные вручную кадры из bright.json в src/assets/photos
 * и дописывает лицензионные данные в src/data/credits.json.
 *
 *   node scripts/fetch_bright.mjs
 *
 * Список PICKS собран глазами по контактным листам (.tmp/bright/*.jpg),
 * номер = индекс кадра внутри слуга в bright.json.
 *
 * Оригиналы с Commons бывают по 8–12 МП; в репозиторий они не нужны, всё
 * равно astro:assets пережимает под вёрстку. Поэтому кадр ужимается до
 * 2400 px по длинной стороне — этого хватает для ретины на всю ширину.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PHOTO_DIR = 'src/assets/photos';
const CREDITS = 'src/data/credits.json';
const MAX_WIDTH = 2400;

// имя файла -> [слуг, индекс в bright.json]
const PICKS = {
  // Первый экран: вместо утрамбованной грунтовки — рассвет над Ангкором.
  'hero': ['angkor-dawn', 28],
  'angkor-dawn-pink': ['angkor-dawn', 29],
  'angkor-dawn-violet': ['angkor-dawn', 21],
  // 'angkor-gold' отбракован: в кадре подпись-водяной знак автора.
  'angkor-mist': ['angkor-dawn', 22],

  'waterfall-kulen': ['waterfall', 8],
  'waterfall-wide': ['waterfall', 9],
  'waterfall-jungle': ['waterfall', 4],
  'waterfall-kohrong': ['waterfall', 13],

  'sea-turquoise': ['turquoise-sea', 17],
  'sea-paradise': ['turquoise-sea', 6],
  'sea-white-sand': ['turquoise-sea', 1],

  'bayon-face': ['temple-warm-light', 7],
  'bayon-reflection': ['temple-warm-light', 9],

  'sunset-mekong': ['palm-sunset', 17],
  'sunset-kampot': ['palm-sunset', 13],
  'palms-field': ['palm-sunset', 9],

  'jungle-river': ['jungle-lush', 4],

  // Кадр для карточки «Люди»: фигура со спины — узнаваемого лица нет,
  // поэтому нет и вопроса о праве на изображение конкретного человека.
  'monk-path': ['monk-robes', 9],
  'monks-temple': ['monk-robes', 15],

  // Четвёртый заход — по референсам заказчика. Присланные им файлы были
  // стоковыми превью с водяными знаками и перезаливами с тревел-блогов;
  // здесь те же сюжеты со свободной лицензией.
  'taprohm-doorway': ['temple-roots', 1],
  'taprohm-root': ['temple-roots', 4],
  'jungle-valley': ['jungle-valley', 8],
  'angkor-gate-face': ['gate-mist', 9],
  'macaque-stone': ['macaque', 5],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(url, tries = 5) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'cambodia-2027-landing/1.0 (image sourcing)' },
      });
      if (res.status === 429) {
        const wait = Math.max(Number(res.headers.get('retry-after') || 3), 3) * 1000 * (i + 1);
        console.log(`    429 — жду ${wait / 1000}s`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (i === tries - 1) throw err;
      await sleep(2000 * (i + 1));
    }
  }
  throw new Error('не скачалось');
}

/** Из "<a ...>Имя</a>" делает "Имя"; Commons отдаёт автора разметкой. */
const stripTags = (s) => String(s || '').replace(/<[^>]*>/g, '').trim();

const bright = JSON.parse(await fs.readFile('bright.json', 'utf8'));
const credits = JSON.parse(await fs.readFile(CREDITS, 'utf8'));
await fs.mkdir(PHOTO_DIR, { recursive: true });

for (const [name, [slug, idx]] of Object.entries(PICKS)) {
  const row = bright[slug]?.[idx];
  if (!row) {
    console.error(`! ${name}: нет ${slug}[${idx}]`);
    continue;
  }
  // Скачивание оригиналов с Commons упирается в лимит времени, поэтому
  // скрипт возобновляемый: уже полученные кадры с записанной лицензией
  // пропускаем и дозакачиваем только недостающие.
  if (credits[name]?.originalUrl === row.descriptionurl) {
    try {
      await fs.access(path.join(PHOTO_DIR, `${name}.jpg`));
      console.log(`${name.padEnd(20)} — уже есть, пропуск`);
      continue;
    } catch { /* файла нет, качаем заново */ }
  }
  try {
    const buf = await download(row.url);
    const out = path.join(PHOTO_DIR, `${name}.jpg`);
    const meta = await sharp(buf).metadata();
    await sharp(buf)
      .rotate()
      .resize({ width: Math.min(MAX_WIDTH, meta.width), withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(out);
    const { size } = await fs.stat(out);

    credits[name] = {
      title: row.title,
      author: stripTags(row.creator) || 'не указан',
      license: row.license,
      licenseUrl: row.license_url || '',
      source: 'Wikimedia Commons',
      originalUrl: row.descriptionurl,
    };
    // Пишем после каждого кадра, иначе обрыв по таймауту теряет всё.
    await fs.writeFile(CREDITS, JSON.stringify(credits, null, 2) + '\n');
    console.log(
      `${name.padEnd(20)} ${String(Math.round(size / 1024)).padStart(5)} КБ  ${row.license}  ${stripTags(row.creator).slice(0, 28)}`,
    );
  } catch (err) {
    console.error(`! ${name}: ${err.message}`);
  }
  await sleep(600);
}

await fs.writeFile(CREDITS, JSON.stringify(credits, null, 2) + '\n');
console.log(`\ncredits.json: ${Object.keys(credits).length} записей`);
