import type { ImageMetadata } from 'astro';
import creditsJson from './credits.json';

/**
 * Реестр фотографий. Файлы лежат в src/assets/photos и подхватываются по имени:
 * ключ изображения в данных = имя файла без расширения.
 *
 * Если файла нет, getPhoto вернёт undefined, и компонент нарисует заглушку —
 * страница не ломается, пока идёт подбор снимков.
 */
const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/photos/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const byKey = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(files)) {
  const key = path.split('/').pop()!.replace(/\.[^.]+$/, '');
  byKey.set(key, mod.default);
}

export interface PhotoCredit {
  title: string | null;
  author: string;
  license: string;
  licenseUrl: string | null;
  source: string;
  originalUrl: string;
}

const credits = creditsJson as Record<string, PhotoCredit>;

export function getPhoto(key: string | undefined): ImageMetadata | undefined {
  return key ? byKey.get(key) : undefined;
}

export function getCredit(key: string | undefined): PhotoCredit | undefined {
  return key ? credits[key] : undefined;
}

/**
 * Описания кадров для мест, где alt негде положить рядом с данными, —
 * прежде всего мини-галереи в аккордеоне маршрута. Раньше они получали
 * общий alt «ещё один кадр этого места»: для монаха, макаки или каменного
 * лика это бесполезно.
 *
 * Ключи здесь нужны только для галерейных снимков; у остальных alt лежит
 * рядом с самим полем image.
 */
const galleryAlts: Record<string, string> = {
  'bayon-face': 'Каменный лик на башне храма Байон крупным планом на фоне синего неба',
  'taprohm-root': 'Гигантский корень дерева, обхвативший резную стену храма Та-Пром',
  'angkor-gate-face': 'Каменное лицо на южных воротах Ангкор-Тхома',
  'macaque-stone': 'Макака сидит на древнем каменном блоке у храма',
  'monks-temple': 'Монахи в оранжевых одеяниях идут между храмовыми руинами',
  'waterfall-jungle': 'Водопад среди зелёных зарослей',
  'waterfall-kohrong': 'Водопад среди мшистых камней и зелени',
  'bayon-reflection': 'Храм Байон, отражённый в воде, под синим небом',
  'angkor-mist': 'Башни Ангкора в утренней дымке над кронами деревьев',
};

/** alt для галерейного снимка; если описания нет — общая подпись с местом. */
export function getGalleryAlt(key: string, placeName: string): string {
  return galleryAlts[key] ?? `${placeName}: ещё один кадр этого места`;
}

/** Все использованные снимки с указанием источника — для блока в подвале. */
export function usedCredits(keys: readonly string[]): Array<PhotoCredit & { key: string }> {
  const seen = new Set<string>();
  const out: Array<PhotoCredit & { key: string }> = [];
  for (const key of keys) {
    const credit = credits[key];
    if (!credit || seen.has(key)) continue;
    seen.add(key);
    out.push({ key, ...credit });
  }
  return out;
}
