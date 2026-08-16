import { TODO_CONTENT, type Pending } from './content';
import { checkProductionContent } from './production';

/**
 * Базовые факты о путешествии — единственный источник правды.
 *
 * Цены, даты, города, параметры маршрута и адрес приёма заявок берутся
 * отсюда: pricing.ts, JSON-LD, SEO и компоненты не должны держать
 * собственные копии этих чисел.
 *
 * Поля со значением TODO_CONTENT организатором ещё не подтверждены.
 * Их нельзя показывать посетителю — за этим следят гейты isReady()
 * в компонентах, а checkProductionContent внизу файла сообщает на сборке,
 * чего именно не хватает.
 */
export const trip = {
  title: 'Камбоджа',
  subtitle: 'Дорога на юг',
  titleLatin: 'Cambodia',

  lead: '10 дней через одну из самых странных и красивых стран Азии. От Ангкора через деревни, джунгли и горы — к морю.',

  dates: {
    start: '2027-02-26',
    end: '2027-03-08',
    human: '26 февраля — 8 марта 2027',
    humanShort: '26.02 — 08.03.2027',
    /** 26 февраля — день прилёта, сам маршрут идёт с 27 февраля по 8 марта. */
    arrivalDay: '2027-02-26',
    ridingDays: 10,
    totalDays: 11,
  },

  start: 'Сиемреап',
  finish: 'Сиануквиль',
  startLatin: 'Siem Reap',
  finishLatin: 'Sihanoukville',

  /** Размер группы не подтверждён — на сайте не показываем. */
  groupSize: TODO_CONTENT as Pending<number>,

  /** Единственное место, где заданы цены. Всё остальное читает отсюда. */
  prices: {
    motorcycle: 2200,
    minibus: 2000,
    island: 1000,
    himalayanUpgrade: 300,
    deposit: 1000,
    currency: 'EUR',
  },

  /** Параметры маршрута. Ни одно значение не подтверждено — см. CONTENT_NEEDED. */
  route: {
    totalDistanceKm: TODO_CONTENT as Pending<number>,
    /** Доли покрытия в процентах; сумма должна давать 100. */
    roadMix: {
      asphalt: TODO_CONTENT as Pending<number>,
      gravel: TODO_CONTENT as Pending<number>,
    },
  },

  /** Требования к участнику за рулём. */
  riding: {
    minimumExperience: TODO_CONTENT as Pending<string>,
    licenseCategory: TODO_CONTENT as Pending<string>,
    internationalPermit: TODO_CONTENT as Pending<string>,
    mandatoryGear: TODO_CONTENT as Pending<readonly string[]>,
  },

  /** Сопровождение колонны. Показываем только то, что реально обеспечивается. */
  support: {
    leadRider: TODO_CONTENT as Pending<string>,
    sweepRider: TODO_CONTENT as Pending<string>,
    localGuide: TODO_CONTENT as Pending<string>,
    supportVehicle: TODO_CONTENT as Pending<string>,
    mechanic: TODO_CONTENT as Pending<string>,
    luggageTransport: TODO_CONTENT as Pending<string>,
    ifRiderStops: TODO_CONTENT as Pending<string>,
    briefing: TODO_CONTENT as Pending<string>,
    insuranceRequired: TODO_CONTENT as Pending<string>,
  },

  /** Оплата и отмена. Публикуем рядом с ценой только подтверждённое. */
  payment: {
    balanceDueBy: TODO_CONTENT as Pending<string>,
    methods: TODO_CONTENT as Pending<readonly string[]>,
    refundPolicy: TODO_CONTENT as Pending<string>,
    cancellationByOrganizer: TODO_CONTENT as Pending<string>,
    termsUrl: TODO_CONTENT as Pending<string>,
  },

  /** Что входит и что не входит в стоимость. */
  inclusions: {
    included: TODO_CONTENT as Pending<readonly string[]>,
    excluded: TODO_CONTENT as Pending<readonly string[]>,
  },

  /**
   * Адрес приёма заявок. Задаётся переменной окружения PUBLIC_LEAD_FORM_ENDPOINT,
   * чтобы не хранить его в репозитории и менять без пересборки кода.
   * Пока не задан — форма показывает запасной путь через Telegram.
   */
  formEndpoint: import.meta.env.PUBLIC_LEAD_FORM_ENDPOINT ?? '',

  contacts: {
    telegram: 'https://t.me/vsemaya',
    telegramHandle: '@vsemaya',
  },

  /** Альтернативные названия — на согласование. Основным остаётся «Дорога на юг». */
  workingTitleAlternatives: [
    'Камбоджа: Дорога на юг',
    'Красная дорога',
    'От Ангкора до моря',
    'Камбоджа насквозь',
    'Десять дней на юг',
    'Между Ангкором и морем',
    'Юг',
  ],
} as const;

/** Первый экран. */
export const hero = {
  kicker: 'Cambodia',
  title: 'Дорога на юг',
  lead: 'Десять дней через одну из самых странных и красивых стран Азии. От Ангкора через деревни, джунгли и горы — к морю.',
  dates: trip.dates.humanShort,
  note: 'Можно ехать на байке или пройти тот же маршрут вместе с нами на микроавтобусе.',
  cta: 'Оставить заявку',
  /**
   * Короткие facts в стиле travel-poster — латиницей, вынесены отдельно
   * от основного текста. Ничего не придумано: даты и маршрут — из trip,
   * длительность — trip.dates.totalDays, модель байка — src/data/bike.ts.
   * «SOUTH COAST» вместо «Sihanoukville» — сознательный выбор поэтичной
   * подписи вместо точного топонима, не искажает факт (это и есть южное
   * побережье, где заканчивается маршрут).
   */
  poster: {
    dates: '26 FEB — 08 MAR',
    route: 'SIEM REAP → SOUTH COAST',
    duration: '11 DAYS',
  },
} as const;

/**
 * Visual-манифест сразу после героя — графический блок-мост перед тем, как
 * начинается объяснение (TripIntro). Число дней («11») — то же самое
 * trip.dates.totalDays, что уже показано в poster-facts героя.
 */
export const manifesto = {
  /**
   * Три слова задают дугу маршрута: храмы на старте, дорога посередине,
   * море в конце. Раньше здесь стояло «Не тур. Не гонка. Не ретрит.» —
   * определение через отрицание. Заказчик его снял: страница должна
   * говорить, что это такое, а не чем оно не является.
   */
  opening: ['Храмы.', 'Дорога.', 'Море.'],
  statementNumber: String(trip.dates.totalDays),
  statementLines: ['дней', 'через Камбоджу', 'к морю.'],
  poetic: [
    'Утром можно делать йогу.',
    'Днём ехать по красной дороге.',
    'Вечером оказаться там,',
    'куда утром и не думали попасть.',
  ],
} as const;

/** Короткий блок сразу под первым экраном. */
export const intro = {
  title: 'Камбоджа открывается с дороги',
  lines: [
    'Через неё едут.',
    'Десять дней подряд страна меняется под колёсами: камень Ангкора, красная земля, вода Тонлесапа, лес, горы, Кампот, море.',
    'Мы едем одной группой. Часть на байках, часть на микроавтобусе. Живём в одних местах, ужинаем за одним столом, утром решаем, во сколько выезжаем.',
  ],
} as const;

/** Блок «на десять дней можно просто уехать». */
export const escape = {
  title: 'На десять дней можно просто уехать',
  lines: [
    'Оставить город. Работу. Обычный ритм.',
    'Утром проснуться у Ангкора. Через несколько дней ехать среди рисовых полей. Потом потеряться где-нибудь между Кампотом и морем.',
    'Будут байки. Будут джунгли. Будет йога. Будут хорошие отели и странные придорожные места. Будет наша компания.',
    'А всё остальное не обязательно знать заранее.',
  ],
  cta: 'Поехать с нами',
} as const;

/**
 * Реестр полей, без которых сайт нельзя публиковать (пункт 10 ТЗ).
 *
 * Проверка выполняется при загрузке модуля, то есть на каждой сборке.
 * По умолчанию печатает список недостающего и не мешает сборке;
 * с STRICT_CONTENT=1 останавливает её.
 */
checkProductionContent([
  { path: 'trip.groupSize', value: trip.groupSize, need: 'размер группы — число участников' },
  {
    path: 'trip.route.totalDistanceKm',
    value: trip.route.totalDistanceKm,
    need: 'общий километраж маршрута',
  },
  {
    path: 'trip.route.roadMix.asphalt',
    value: trip.route.roadMix.asphalt,
    need: 'доля асфальта в процентах',
  },
  {
    path: 'trip.route.roadMix.gravel',
    value: trip.route.roadMix.gravel,
    need: 'доля грунта в процентах',
  },
  {
    path: 'trip.riding.minimumExperience',
    value: trip.riding.minimumExperience,
    need: 'минимальный требуемый опыт езды',
  },
  {
    path: 'trip.riding.licenseCategory',
    value: trip.riding.licenseCategory,
    need: 'категория прав',
  },
  {
    path: 'trip.riding.internationalPermit',
    value: trip.riding.internationalPermit,
    need: 'нужно ли международное водительское удостоверение',
  },
  {
    path: 'trip.riding.mandatoryGear',
    value: trip.riding.mandatoryGear,
    need: 'обязательная защитная экипировка',
  },
  {
    path: 'trip.support.supportVehicle',
    value: trip.support.supportVehicle,
    need: 'есть ли машина сопровождения и что она везёт',
  },
  {
    path: 'trip.support.luggageTransport',
    value: trip.support.luggageTransport,
    need: 'как перевозится багаж',
  },
  {
    path: 'trip.support.localGuide',
    value: trip.support.localGuide,
    need: 'местный мото-гид: есть ли и с какой лицензией',
  },
  {
    path: 'trip.support.ifRiderStops',
    value: trip.support.ifRiderStops,
    need: 'что происходит, если участник не может продолжить перегон',
  },
  {
    path: 'trip.support.insuranceRequired',
    value: trip.support.insuranceRequired,
    need: 'какая страховка обязательна',
  },
  {
    path: 'trip.inclusions.included',
    value: trip.inclusions.included,
    need: 'точный список того, что входит в стоимость',
  },
  {
    path: 'trip.inclusions.excluded',
    value: trip.inclusions.excluded,
    need: 'точный список того, что не входит',
  },
  {
    path: 'trip.payment.balanceDueBy',
    value: trip.payment.balanceDueBy,
    need: 'срок внесения остатка оплаты',
  },
  {
    path: 'trip.payment.refundPolicy',
    value: trip.payment.refundPolicy,
    need: 'условия возврата предоплаты',
  },
  {
    path: 'trip.formEndpoint',
    value: trip.formEndpoint,
    need: 'адрес приёма заявок в переменной PUBLIC_LEAD_FORM_ENDPOINT',
  },
]);
