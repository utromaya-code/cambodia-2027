/**
 * Контактные листы для кандидатов из bright.json.
 *
 *   node scripts/bright_sheets.mjs [slug ...]
 *
 * Кадры выбираются глазами, а не по названию файла: в прошлые заходы
 * «Cambodia sunset» на деле оказывался серым небом над парковкой.
 * Результат — .tmp/bright/<slug>-N.jpg, сетка пронумерованных превью.
 * Номер на плашке = индекс в bright.json, по нему потом качаем оригинал.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'bright.json';
const OUT_DIR = '.tmp/bright';
const COLS = 5;
const CELL_W = 300;
const CELL_H = 200;
const PAD = 4;
const LABEL = 20;
const MAX_PER_SHEET = 20;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchThumb(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'cambodia-2027-landing/1.0 (image sourcing)' },
      });
      if (res.status === 429) {
        const wait = Number(res.headers.get('retry-after') || 2) * 1000 * (i + 1);
        await sleep(Math.max(wait, 2000));
        continue;
      }
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      await sleep(1500 * (i + 1));
    }
  }
  return null;
}

const data = JSON.parse(await fs.readFile(SRC, 'utf8'));
const only = process.argv.slice(2);
await fs.mkdir(OUT_DIR, { recursive: true });

for (const [slug, rows] of Object.entries(data)) {
  if (only.length && !only.includes(slug)) continue;
  if (!rows.length) continue;

  for (let sheet = 0; sheet * MAX_PER_SHEET < rows.length; sheet++) {
    const chunk = rows.slice(sheet * MAX_PER_SHEET, (sheet + 1) * MAX_PER_SHEET);
    const gridRows = Math.ceil(chunk.length / COLS);
    const W = COLS * (CELL_W + PAD) + PAD;
    const H = gridRows * (CELL_H + LABEL + PAD) + PAD;
    const composites = [];

    for (let i = 0; i < chunk.length; i++) {
      const row = chunk[i];
      const idx = sheet * MAX_PER_SHEET + i;
      const col = i % COLS;
      const r = Math.floor(i / COLS);
      const x = PAD + col * (CELL_W + PAD);
      const y = PAD + r * (CELL_H + LABEL + PAD);

      const buf = row.thumb ? await fetchThumb(row.thumb) : null;
      if (buf) {
        try {
          const img = await sharp(buf)
            .resize(CELL_W, CELL_H, { fit: 'cover' })
            .jpeg({ quality: 78 })
            .toBuffer();
          composites.push({ input: img, left: x, top: y });
        } catch { /* повреждённое превью просто пропускаем */ }
      }
      const name = String(row.title || '').replace(/^File:/, '').slice(0, 34);
      const svg =
        `<svg width="${CELL_W}" height="${LABEL}">` +
        `<rect width="100%" height="100%" fill="#111"/>` +
        `<text x="3" y="14" font-family="sans-serif" font-size="12" fill="#ffe94d">${idx}</text>` +
        `<text x="26" y="14" font-family="sans-serif" font-size="11" fill="#fff">` +
        `${name.replace(/[<>&]/g, '')}</text></svg>`;
      composites.push({ input: Buffer.from(svg), left: x, top: y + CELL_H });
      await sleep(120);
    }

    const out = path.join(OUT_DIR, `${slug}-${sheet}.jpg`);
    await sharp({ create: { width: W, height: H, channels: 3, background: '#222' } })
      .composite(composites)
      .jpeg({ quality: 80 })
      .toFile(out);
    console.log('wrote', out, chunk.length, 'кадров');
  }
}
