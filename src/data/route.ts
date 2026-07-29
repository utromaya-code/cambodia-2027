/** Точка маршрута на карте. */
export interface RoutePoint {
  id: string;
  name: string;
  latin: string;
  /** Широта и долгота — по ним строится SVG-карта. */
  lat: number;
  lon: number;
  /** Одно предложение, которое показывается при наведении и на мобильной версии. */
  note: string;
  /** Ключ изображения из src/data/images.ts. */
  image: string;
  /**
   * Дополнительные кадры для мини-галереи в раскрытой карточке точки —
   * необязательные, показываются вместе с основным `image`. Километраж
   * и % покрытия по дням сюда намеренно не добавлены: этих данных нет
   * ни по точкам, ни по дням (см. days.ts и CONTENT_NEEDED.md), а показывать
   * готовы только то, что подтверждено.
   */
  gallery?: readonly string[];
  /** Дни программы, к которым относится точка. */
  days: number[];
}

/**
 * Десять точек маршрута с севера на юг. Порядок задаёт линию на карте
 * и вертикальный список на мобильных.
 */
export const routePoints: readonly RoutePoint[] = [
  {
    id: 'siem-reap',
    name: 'Сиемреап',
    latin: 'Siem Reap',
    lat: 13.3618,
    lon: 103.8598,
    note: 'Отсюда всё начинается: знакомство, техника, первый общий ужин.',
    image: 'siem-reap',
    gallery: ['siem-reap-2'],
    days: [1],
  },
  {
    id: 'angkor',
    name: 'Ангкор',
    latin: 'Angkor',
    lat: 13.4125,
    lon: 103.867,
    note: 'Рассвет над Ангкор-Ватом, корни Та-Прома и лица Байона до того, как приедут автобусы.',
    image: 'angkor-wat-sunrise',
    gallery: ['angkor-wat-sunrise-2'],
    days: [2],
  },
  {
    id: 'phnom-kulen',
    name: 'Пном Кулен',
    latin: 'Phnom Kulen',
    lat: 13.5772,
    lon: 104.0464,
    note: 'Священная гора, вода в лесу и Бенг Мелеа — храм, который джунгли забирают обратно.',
    image: 'phnom-kulen',
    gallery: ['phnom-kulen-2'],
    days: [3],
  },
  {
    id: 'battambang',
    name: 'Баттамбанг',
    latin: 'Battambang',
    lat: 13.0957,
    lon: 103.2022,
    note: 'Первый большой переход, рисовые поля и летучие мыши, вылетающие из горы на закате.',
    image: 'battambang',
    gallery: ['battambang-2'],
    days: [4],
  },
  {
    id: 'kampong-chhnang',
    name: 'Кампонгчнанг',
    latin: 'Kampong Chhnang',
    lat: 12.25,
    lon: 104.6667,
    note: 'Гончарные деревни и жизнь на воде Тонлесапа — лодки, сети, дома на сваях.',
    image: 'tonle-sap',
    gallery: ['tonle-sap-2'],
    days: [5],
  },
  {
    id: 'kirirom',
    name: 'Кириром',
    latin: 'Kirirom',
    lat: 11.3167,
    lon: 104.0333,
    note: 'Равнина заканчивается: сосны, горы и первая прохлада за всю дорогу.',
    image: 'kirirom',
    gallery: ['kirirom-2'],
    days: [6],
  },
  {
    id: 'kampot',
    name: 'Кампот',
    latin: 'Kampot',
    lat: 10.6104,
    lon: 104.181,
    note: 'Река, колониальные кварталы, перец и длинные вечера без спешки.',
    image: 'kampot',
    gallery: ['kampot-2'],
    days: [7, 9],
  },
  {
    id: 'bokor',
    name: 'Бокор',
    latin: 'Bokor',
    lat: 10.6478,
    lon: 104.0206,
    note: 'Серпантин в облако: туман, тропический лес и панорама всего побережья.',
    image: 'bokor',
    gallery: ['bokor-2'],
    days: [8],
  },
  {
    id: 'ream',
    name: 'Реам',
    latin: 'Ream',
    lat: 10.5,
    lon: 103.8333,
    note: 'Последний ходовой день: локальные дороги, лес и мангры на выходе к морю.',
    image: 'ream',
    gallery: ['ream-2'],
    days: [10],
  },
  {
    id: 'sihanoukville',
    name: 'Сиануквиль',
    latin: 'Sihanoukville',
    lat: 10.6093,
    lon: 103.5296,
    note: 'Финал дороги. Море, последний закат путешествия и общий ужин.',
    image: 'sihanoukville',
    gallery: ['sihanoukville-2'],
    days: [10, 11],
  },
];

/** Дополнительная программа — остров, отдельно от основного маршрута. */
export const islandPoint = {
  id: 'koh-rong',
  name: 'Ко Ронг',
  latin: 'Koh Rong',
  lat: 10.7167,
  lon: 103.25,
  note: 'Отдельная программа после дороги: 8–15 марта.',
  image: 'koh-rong',
} as const;

/**
 * Границы карты охватывают всю Камбоджу, а не только маршрут:
 * так силуэт страны узнаётся и видно, какую её часть мы проезжаем.
 * При изменении нужно заново прогнать scripts/build_map.mjs.
 */
export const mapBounds = {
  minLon: 102.2,
  maxLon: 107.8,
  minLat: 9.8,
  maxLat: 14.8,
} as const;
