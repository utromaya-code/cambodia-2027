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
