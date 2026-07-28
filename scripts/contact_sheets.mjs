/**
 * Собирает контактные листы из кандидатов Commons, чтобы кадры можно было
 * отсмотреть глазами, а не выбирать по названию файла.
 *
 *   node scripts/contact_sheets.mjs [slug ...]
 *
 * Результат: .tmp/sheets/<slug>.jpg — сетка пронумерованных превью.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const CANDIDATES = 'commons.json';
const OUT_DIR = '.tmp/sheets';
const COLS = 4;
const CELL_W = 320;
const CELL_H = 220;
const PAD = 6;
const MAX_PER_SHEET = 16;

const escapeXml = (s) =>
  String(s).replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c],
  );

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Wikimedia отдаёт 429 с заголовком Retry-After (обычно 1 секунда).
 * Ждём ровно столько, сколько просят, — экспоненциальный бэкофф здесь
 * замедляет сборку на порядок без всякой пользы.
 */
async function fetchBuffer(url, attempt = 0) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'cambodia-2027-landing/1.0 (image sourcing)' },
    signal: AbortSignal.timeout(60_000),
  });
  if (res.status === 429 && attempt < 8) {
    const retryAfter = Number(res.headers.get('retry-after')) || 1;
    await sleep(retryAfter * 1000 + 250);
    return fetchBuffer(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Превью с номером в углу, чтобы на листе можно было сослаться на кадр. */
async function makeCell(row, index) {
  const buf = await fetchBuffer(row.thumb || row.url);
  const img = await sharp(buf)
    .resize(CELL_W, CELL_H, { fit: 'cover', position: 'attention' })
    .toBuffer();

  const label = Buffer.from(
    `<svg width="${CELL_W}" height="${CELL_H}" xmlns="http://www.w3.org/2000/svg">
       <rect x="0" y="0" width="46" height="30" fill="#000" opacity="0.75"/>
       <text x="8" y="21" font-family="monospace" font-size="18" fill="#fff">${index}</text>
       <rect x="0" y="${CELL_H - 22}" width="${CELL_W}" height="22" fill="#000" opacity="0.6"/>
       <text x="6" y="${CELL_H - 7}" font-family="monospace" font-size="12" fill="#fff">${escapeXml(
         `${row.width}x${row.height} ${String(row.license || '').slice(0, 18)}`,
       )}</text>
     </svg>`,
  );

  return sharp(img).composite([{ input: label, top: 0, left: 0 }]).toBuffer();
}

async function buildSheet(slug, rows) {
  const picked = rows.slice(0, MAX_PER_SHEET);
  const cells = [];
  for (const [i, row] of picked.entries()) {
    try {
      cells.push({ buf: await makeCell(row, i), index: i });
    } catch (err) {
      console.warn(`  ! ${slug}[${i}]: ${err.message}`);
    }
  }
  if (!cells.length) return null;

  const cols = Math.min(COLS, cells.length);
  const rowsCount = Math.ceil(cells.length / cols);
  const width = cols * (CELL_W + PAD) + PAD;
  const height = rowsCount * (CELL_H + PAD) + PAD;

  const composites = cells.map((cell, i) => ({
    input: cell.buf,
    left: PAD + (i % cols) * (CELL_W + PAD),
    top: PAD + Math.floor(i / cols) * (CELL_H + PAD),
  }));

  const out = path.join(OUT_DIR, `${slug}.jpg`);
  await sharp({
    create: { width, height, channels: 3, background: '#141414' },
  })
    .composite(composites)
    .jpeg({ quality: 78 })
    .toFile(out);

  console.log(`${slug}: ${cells.length} кадров -> ${out}`);
  return out;
}

const data = JSON.parse(await fs.readFile(CANDIDATES, 'utf8'));
const only = process.argv.slice(2);
await fs.mkdir(OUT_DIR, { recursive: true });

for (const [slug, rows] of Object.entries(data)) {
  if (only.length && !only.includes(slug)) continue;
  if (!rows?.length) continue;
  await buildSheet(slug, rows);
}
