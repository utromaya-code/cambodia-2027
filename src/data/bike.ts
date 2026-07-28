import { TODO_CONTENT, type Pending } from './content';

/**
 * Модель байка подтверждена организатором. Всё остальное — комплектация,
 * депозит, требования к правам — пока нет, поэтому TODO_CONTENT.
 *
 * Важно: стоимость аренды у прокатчика — внутренняя цифра, на сайте не публикуется.
 * Пока организатор не подтвердил, НЕ писать, что аренда входит в €2 200.
 */
export const bike = {
  model: 'Royal Enfield Scram 411',
  engine: '411 cc',
  transmission: 'Механическая коробка',
  posture: 'Прямая посадка',
  build: 'Универсальная adventure-конструкция',

  title: 'На чём едем',
  subtitle: 'Именно такой байк здесь и нужен.',

  description: [
    'Не спортивный эндуро и не огромный туристический мотоцикл.',
    'Royal Enfield Scram 411 — простой универсальный байк, на котором удобно провести день на обычной дороге, свернуть на грунт, проехать через деревню, подняться в горы и вечером спокойно доехать до отеля.',
    'Мы не делаем из техники культ. Она просто не должна мешать путешествию.',
  ],

  closing: [
    'Достаточно настоящий, чтобы свернуть с асфальта.',
    'Достаточно спокойный, чтобы смотреть по сторонам.',
  ],

  specs: [
    { label: 'Двигатель', value: '411 см³' },
    { label: 'Коробка', value: 'Механическая' },
    { label: 'Посадка', value: 'Прямая' },
    { label: 'Тип', value: 'Adventure' },
  ],

  /** Не подтверждено — на сайте не показываем. */
  includedInPrice: TODO_CONTENT as Pending<boolean>,
  helmetIncluded: TODO_CONTENT as Pending<boolean>,
  luggageSystem: TODO_CONTENT as Pending<string>,
  deposit: TODO_CONTENT as Pending<string>,
  licenseRequirements: TODO_CONTENT as Pending<string>,

  image: 'bike-scram',
} as const;

/**
 * Блок про безопасность. Ни одно поле не подтверждено, поэтому секция
 * скрыта флагом featureFlags.motorcycleSpecs — обещаний не даём.
 */
export const safety = {
  title: 'Про байки и безопасность',
  bikeModel: bike.model,
  engineSize: bike.engine,
  minimumExperience: TODO_CONTENT as Pending<string>,
  licenseRequired: TODO_CONTENT as Pending<string>,
  internationalDrivingPermit: TODO_CONTENT as Pending<string>,
  terrainPavedPercent: TODO_CONTENT as Pending<number>,
  terrainUnpavedPercent: TODO_CONTENT as Pending<number>,
  averageDailyKm: TODO_CONTENT as Pending<number>,
  maximumDailyKm: TODO_CONTENT as Pending<number>,
  supportVehicle: TODO_CONTENT as Pending<string>,
  mechanic: TODO_CONTENT as Pending<string>,
  spareBike: TODO_CONTENT as Pending<string>,
  medicalSupport: TODO_CONTENT as Pending<string>,
  luggageTransport: TODO_CONTENT as Pending<string>,
  insuranceRequirements: TODO_CONTENT as Pending<string>,
  damagePolicy: TODO_CONTENT as Pending<string>,
} as const;
