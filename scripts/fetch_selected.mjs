/**
 * Скачивает отобранные кадры и записывает данные об авторстве.
 *
 *   node scripts/fetch_selected.mjs
 *
 * Источник выбора — picks.json вида { "<ключ>": { "slug": "bokor", "index": 3 } }.
 * Кадры кладутся в src/assets/photos/<ключ>.jpg, а источник, автор, лицензия
 * и ссылка на оригинал — в src/data/credits.json.
 *
 * Скрипт умышленно ничего не выбирает сам: без записи в picks.json
 * изображение на сайт не попадёт.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUT_DIR = 'src/assets/photos';
const CREDITS = 'src/data/credits.json';
const MAX_WIDTH = 2800;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchBuffer(url, attempt = 0) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'cambodia-2027-landing/1.0 (image sourcing)' },
    signal: AbortSignal.timeout(120_000),
  });
  // Wikimedia сама сообщает, сколько ждать — слушаем её, а не гадаем.
  if (res.status === 429 && attempt < 10) {
    const retryAfter = Number(res.headers.get('retry-after')) || 1;
    await sleep(retryAfter * 1000 + 300);
    return fetchBuffer(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

const candidates = JSON.parse(await fs.readFile('commons.json', 'utf8'));
const picks = JSON.parse(await fs.readFile('picks.json', 'utf8'));

await fs.mkdir(OUT_DIR, { recursive: true });

let credits = {};
try {
  credits = JSON.parse(await fs.readFile(CREDITS, 'utf8'));
} catch {
  credits = {};
}

for (const [key, pick] of Object.entries(picks)) {
  const row = candidates[pick.slug]?.[pick.index];
  if (!row) {
    console.error(`! ${key}: нет кандидата ${pick.slug}[${pick.index}]`);
    continue;
  }

  const dest = path.join(OUT_DIR, `${key}.jpg`);
  try {
    await fs.access(dest);
    console.log(`= ${key} уже скачан`);
  } catch {
    const buf = await fetchBuffer(row.url);
    // Ужимаем до разумной ширины: дальше Astro сам сделает срезы и WebP/AVIF.
    await sharp(buf)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(dest);
    const { size } = await fs.stat(dest);
    console.log(`+ ${key}: ${(size / 1024 / 1024).toFixed(1)} MB`);
    await sleep(800);
  }

  credits[key] = {
    title: row.title,
    author: row.creator || 'не указан',
    license: row.license,
    licenseUrl: row.license_url ?? null,
    source: row.source,
    originalUrl: row.descriptionurl ?? row.url,
  };
}

await fs.writeFile(CREDITS, JSON.stringify(credits, null, 2) + '\n', 'utf8');
console.log(`\n${Object.keys(credits).length} записей об авторстве -> ${CREDITS}`);
