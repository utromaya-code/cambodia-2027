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

/** Основная команда мотопутешествия. */
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
    role: 'Организатор путешествия',
    shortBio:
      'Организует авторские путешествия с 2009 года. Преподаватель йоги и медитации, основатель Yoga-Fest и «Вселенной нейрохакинга». Отвечает за атмосферу поездки, программу и общий ритм группы.',
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
  lead: 'Команда проходит с группой весь маршрут — от первой встречи в Сиемреапе до моря.',
} as const;

/** На островной программе остаются Илья и Леонид. */
export const islandLeaders = leaders.filter(
  (leader) => leader.id === 'ilya-barinov' || leader.id === 'leonid-kutuzov',
);

export const islandLeadersSection = {
  title: 'Ведущие островной программы',
  lead: 'Илья Баринов и Леонид Кутузов проведут практики и всю неделю будут вместе с группой на Ко Ронге.',
} as const;
