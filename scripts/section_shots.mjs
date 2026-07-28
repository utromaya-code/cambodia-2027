/**
 * Снимает отдельные секции — так их можно рассмотреть, а не разглядывать
 * страницу целиком одним огромным скриншотом.
 *
 *   node scripts/section_shots.mjs <селектор> [имя] [ширина]
 */
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const [selector, name = 'section', width = '1440'] = process.argv.slice(2);
const URL = 'http://localhost:4321/cambodia-2027';

await fs.mkdir('.tmp/shots', { recursive: true });

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
  deviceScaleFactor: 1.5,
});
await page.goto(URL, { waitUntil: 'networkidle', timeout: 60_000 });

await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 50));
  }
});
await page.waitForTimeout(800);

const el = await page.$(selector);
if (!el) throw new Error(`не найден селектор ${selector}`);
await el.scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await el.screenshot({ path: `.tmp/shots/${name}.png` });
console.log(`.tmp/shots/${name}.png`);

await browser.close();
