import { TODO_CONTENT, type Pending } from './content';

export interface Leader {
  id: string;
  name: string;
  role: string;
  /** Короткое био. TODO_CONTENT — пока не предоставлено, карточка выводится без текста. */
  shortBio: Pending<string>;
  /** Ключ портрета из src/data/images.ts. TODO_CONTENT — рисуем заглушку. */
  portrait: Pending<string>;
  url?: string;
}

/**
 * Био Ильи и Андрея взяты с действующих сайтов организаторов
 * (kanchenjunga.ru, dahab-camp.ru) — это подтверждённые факты.
 * По Леониду и Елене данных нет: ставим TODO_CONTENT, ничего не придумываем.
 */
export const leaders: readonly Leader[] = [
  {
    id: 'ilya-barinov',
    name: 'Илья Баринов',
    role: 'Практики',
    shortBio:
      'Больше 20 лет занимается телесными и восточными практиками. Реабилитолог, кинезиолог, трёхкратный чемпион Европы по тайцзи-цюань. Ведёт онлайн-курс «Точка опоры». Если утром кто-то расстилает коврик у реки — обычно это он.',
    portrait: 'leader-ilya',
  },
  {
    id: 'leonid-kutuzov',
    name: 'Леонид Кутузов',
    role: TODO_CONTENT as unknown as string,
    shortBio: TODO_CONTENT,
    portrait: TODO_CONTENT,
  },
  {
    id: 'andrey-baranov',
    name: 'Андрей Баранов',
    role: 'Маршрут и логистика',
    shortBio:
      '20 лет организует путешествия и экспедиционные программы — Тибет, Патагония, Япония, Индия, Китай. Отвечает за то, чтобы дорога, размещение и местная команда работали, а участникам не приходилось решать организационные вопросы посреди маршрута.',
    portrait: 'leader-andrey',
  },
  {
    id: 'elena',
    name: 'Елена',
    role: TODO_CONTENT as unknown as string,
    shortBio: TODO_CONTENT,
    portrait: TODO_CONTENT,
  },
];

export const leadersSection = {
  title: 'Четыре ведущих. Одна дорога.',
  lead: 'Поездка держится не на расписании, а на людях. С этими четырьмя вы проведёте десять дней подряд — в дороге, за столом и на берегу.',
} as const;
