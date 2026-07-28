/**
 * Готовит SVG-контур Камбоджи для карты маршрута.
 *
 *   node scripts/build_map.mjs
 *
 * Источник — Natural Earth (public domain) через пакет world-atlas.
 * Контур считается один раз и сохраняется в src/data/cambodia-shape.ts,
 * поэтому в рантайме и в зависимостях сайта картографии нет.
 */
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import * as topojson from 'topojson-client';

const require = createRequire(import.meta.url);
const world = require('world-atlas/countries-50m.json');

const CAMBODIA_ID = '116'; // ISO 3166-1 numeric

// Рамка карты должна совпадать с mapBounds из src/data/route.ts.
const BOUNDS = { minLon: 102.2, maxLon: 107.8, minLat: 9.8, maxLat: 14.8 };
const VIEW = { width: 1000, height: 1000 };

const countries = topojson.feature(world, world.objects.countries);
const cambodia = countries.features.find(
  (f) => f.id === CAMBODIA_ID || f.properties?.name === 'Cambodia',
);
if (!cambodia) throw new Error('Камбоджа не найдена в наборе Natural Earth');

/**
 * Равнопромежуточная проекция с поправкой на широту: на 12° с.ш. градус долготы
 * примерно на 2% короче градуса широты, без коррекции страна выглядит растянутой.
 */
const midLat = ((BOUNDS.minLat + BOUNDS.maxLat) / 2) * (Math.PI / 180);
const lonScale = Math.cos(midLat);

const spanLon = (BOUNDS.maxLon - BOUNDS.minLon) * lonScale;
const spanLat = BOUNDS.maxLat - BOUNDS.minLat;
const scale = Math.min(VIEW.width / spanLon, VIEW.height / spanLat);

const offsetX = (VIEW.width - spanLon * scale) / 2;
const offsetY = (VIEW.height - spanLat * scale) / 2;

function project(lon, lat) {
  const x = (lon - BOUNDS.minLon) * lonScale * scale + offsetX;
  const y = (BOUNDS.maxLat - lat) * scale + offsetY;
  return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
}

function ringToPath(ring) {
  return (
    ring
      .map(([lon, lat], i) => {
        const [x, y] = project(lon, lat);
        return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
      })
      .join('') + 'Z'
  );
}

const polygons =
  cambodia.geometry.type === 'MultiPolygon'
    ? cambodia.geometry.coordinates
    : [cambodia.geometry.coordinates];

// Берём только заметные контуры, чтобы не тащить мелкие острова в путь.
const path = polygons
  .flatMap((poly) => poly.slice(0, 1))
  .filter((ring) => ring.length > 12)
  .map(ringToPath)
  .join('');

const out = `// Файл создан скриптом scripts/build_map.mjs — вручную не редактировать.
// Источник контура: Natural Earth 1:50m (public domain) через пакет world-atlas.

/** Контур Камбоджи в системе координат ${VIEW.width}×${VIEW.height}. */
export const cambodiaPath =
  '${path}';

export const mapViewBox = '0 0 ${VIEW.width} ${VIEW.height}';

/** Проекция широты и долготы в координаты того же viewBox. */
export function projectPoint(lon: number, lat: number): { x: number; y: number } {
  const lonScale = ${lonScale.toFixed(10)};
  const scale = ${scale.toFixed(6)};
  const offsetX = ${offsetX.toFixed(4)};
  const offsetY = ${offsetY.toFixed(4)};
  return {
    x: (lon - ${BOUNDS.minLon}) * lonScale * scale + offsetX,
    y: (${BOUNDS.maxLat} - lat) * scale + offsetY,
  };
}
`;

await fs.writeFile('src/data/cambodia-shape.ts', out, 'utf8');
console.log(`Контур: ${path.length} символов -> src/data/cambodia-shape.ts`);
