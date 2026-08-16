import { TODO_CONTENT, type Pending } from './content';

/**
 * Базовый байк поездки — Honda FTR 230, подтверждён организатором.
 *
 * Про название: модель продавалась в Азии как FTR 230, но реальный объём
 * двигателя — 223 см³ (это же поколение известно как FTR 223). На сайте
 * показываем 223 см³, потому что это факт, а «230» оставляем в названии
 * модели, потому что так байк называется у прокатчика.
 *
 * Характеристики сверены по независимым спецификациям модели (bikez,
 * ultimatespecs): одноцилиндровый четырёхтактный, воздушное охлаждение,
 * 6 ступеней, снаряжённая масса 128 кг, высота седла 780 мм.
 *
 * Чего здесь намеренно нет: заявлений про проходимость и про долю грунта.
 * У модели 17-дюймовые колёса с дорожной резиной и барабанный тормоз сзади,
 * поэтому обещать «свернуть на любой грунт» было бы неправдой, а точная
 * раскладка покрытия по маршруту не подтверждена (см. safety ниже).
 *
 * Важно: стоимость аренды у прокатчика — внутренняя цифра, на сайте
 * не публикуется. Пока организатор не подтвердил, НЕ писать, что аренда
 * входит в €2 200.
 */
export const bike = {
  model: 'Honda FTR 230',
  engine: '223 cc',
  transmission: 'Механическая коробка, 6 ступеней',
  posture: 'Прямая посадка',
  build: 'Лёгкий универсальный байк',

  title: 'На чём едем',
  subtitle: 'Лёгкий байк, на котором думаешь о дороге, а не о технике.',

  description: [
    'Honda FTR 230 — простой универсальный байк: 128 кг снаряжённой массы, седло на высоте 780 мм, шестиступенчатая коробка.',
    'Такой вес и посадка означают, что байк легко ставится на ноги на стоянке, не выматывает за день и спокойно переносит городской трафик и разбитую обочину.',
    'Техника здесь — инструмент: она должна просто работать, чтобы всё внимание осталось дороге и стране.',
  ],

  closing: [
    'Достаточно лёгкий, чтобы не уставать за день.',
    'Достаточно простой, чтобы не думать о нём вообще.',
  ],

  specs: [
    { label: 'Двигатель', value: '223 см³' },
    { label: 'Коробка', value: '6 ступеней' },
    { label: 'Снаряжённая масса', value: '128 кг' },
    { label: 'Высота седла', value: '780 мм' },
  ],

  /** Не подтверждено — на сайте не показываем. */
  includedInPrice: TODO_CONTENT as Pending<boolean>,
  helmetIncluded: TODO_CONTENT as Pending<boolean>,
  luggageSystem: TODO_CONTENT as Pending<string>,
  deposit: TODO_CONTENT as Pending<string>,
  licenseRequirements: TODO_CONTENT as Pending<string>,

  image: 'bike-ftr',
} as const;

/**
 * Апгрейд на Royal Enfield Himalayan за доплату.
 *
 * Организатор передал это словом «возможно»: цена доплаты названа, а вот
 * гарантированное наличие — нет. Поэтому блок сформулирован как запрос,
 * а не как оферта: указываем доплату и прямо говорим, что наличие
 * подтверждается при бронировании. Обещать конкретный байк, которого может
 * не оказаться, на странице с ценой €2 200 нельзя.
 *
 * Кадры для блока — из архива организаторов: в бутанской экспедиции группа
 * ехала как раз на Himalayan, так что фотографии показывают ровно ту
 * технику, о которой идёт речь.
 */
export const bikeUpgrade = {
  title: 'Хочется мотоцикл побольше',
  model: 'Royal Enfield Himalayan 411 / 450',
  surchargeHuman: '+€300',
  lines: [
    'Для тех, кто уже уверенно ездит и хочет более крупный и мощный байк, возможен апгрейд на Royal Enfield Himalayan — 411 или 450, в зависимости от того, что будет в парке.',
    'Наличие подтверждаем при бронировании: количество таких байков ограничено, и заранее гарантировать конкретную модель мы не можем.',
  ],
  photos: [
    {
      image: 'crew-group',
      alt: 'Участники прошлой экспедиции на мотоциклах Royal Enfield Himalayan',
    },
    {
      image: 'crew-chortens',
      alt: 'Royal Enfield Himalayan на стоянке у чортенов',
    },
  ],
  note: 'Фотографии Himalayan — с нашей прошлой экспедиции в Бутане.',
} as const;

/**
 * Третья модель, о которой сказал организатор, — CFMoto MT450.
 * Условия и наличие пока не переданы, поэтому на сайте её нет.
 * Как только появятся данные, добавляем сюда и в блок апгрейда.
 */
export const bikeThirdOption = {
  model: 'CFMoto MT450',
  terms: TODO_CONTENT as Pending<string>,
  availability: TODO_CONTENT as Pending<string>,
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
