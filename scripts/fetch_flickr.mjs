/**
 * Скачивает отобранные кадры из flickr.json (Openverse -> Flickr).
 * Отдельно от fetch_bright.mjs, потому что источник и структура другие.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PHOTO_DIR = 'src/assets/photos';
const CREDITS = 'src/data/credits.json';
const MAX_WIDTH = 2400;

const PICKS = {
  'sea-treehouse': ['sea', 2],
  'taprohm-sky': ['jungle', 18],
  // 'beng-mealea-jungle' отбракован: в углу вшита подпись автора.
  // Лицензия это допускает, но на лендинге такая подпись выглядит так же,
  // как стоковый водяной знак.
  'red-road-bike': ['rice-green', 9],
  'rice-storm': ['rice-green', 0],
  'rice-palms': ['rice-green', 10],
  'paddy-sunset': ['rice-green', 16],
  'sunset-temple': ['sunset-wide', 8],
  'sea-jetty': ['sea', 5],
  'coast-sunset': ['coast-bright', 3],
  'kampot-pier-sunset': ['kampot-river', 16],
  'lanterns': ['siem-reap-life', 2],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'cambodia-2027-landing/1.0' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (i === tries - 1) throw err;
      await sleep(1500 * (i + 1));
    }
  }
}

const src = JSON.parse(await fs.readFile('flickr.json', 'utf8'));
const credits = JSON.parse(await fs.readFile(CREDITS, 'utf8'));

for (const [name, [slug, idx]] of Object.entries(PICKS)) {
  const row = src[slug]?.[idx];
  if (!row) { console.error('! нет', slug, idx); continue; }
  try {
    const buf = await download(row.url);
    const meta = await sharp(buf).metadata();
    const out = path.join(PHOTO_DIR, `${name}.jpg`);
    await sharp(buf).rotate()
      .resize({ width: Math.min(MAX_WIDTH, meta.width), withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true }).toFile(out);
    const { size } = await fs.stat(out);
    credits[name] = {
      title: row.title,
      author: row.creator || 'не указан',
      license: row.license,
      licenseUrl: row.license_url || '',
      source: 'Flickr (через Openverse)',
      originalUrl: row.descriptionurl,
    };
    await fs.writeFile(CREDITS, JSON.stringify(credits, null, 2) + '\n');
    console.log(`${name.padEnd(20)} ${String(Math.round(size/1024)).padStart(5)} КБ  ${row.license}  ${row.creator}`);
  } catch (e) { console.error('!', name, e.message); }
  await sleep(500);
}
console.log('credits:', Object.keys(credits).length);
