/**
 * Механизм работы с неподтверждёнными данными.
 *
 * Часть фактов о поездке на момент вёрстки не подтверждена организатором:
 * комплектация цены, требования к опыту, отели, размер группы и т.д.
 * Такие поля помечаются значением TODO_CONTENT — и компоненты обязаны
 * скрывать их, а не показывать выдуманное значение.
 *
 * Полный список недостающего — в CONTENT_NEEDED.md.
 */

export const TODO_CONTENT = '__TODO_CONTENT__' as const;
export type TodoContent = typeof TODO_CONTENT;

/** Значение, которое ещё предстоит получить от организатора. */
export type Pending<T> = T | TodoContent;

/** true, если значение подтверждено и его можно показывать на сайте. */
export function isReady<T>(value: Pending<T>): value is T {
  return value !== TODO_CONTENT;
}

/** Оставляет только подтверждённые значения. */
export function onlyReady<T>(values: readonly Pending<T>[]): T[] {
  return values.filter(isReady);
}

/**
 * Флаги секций, которые нельзя публиковать до получения данных.
 * Переключаются здесь же, когда информация появится.
 */
export const featureFlags = {
  /** Технические характеристики и требования к опыту — нет данных. */
  motorcycleSpecs: false,
  /** Конкретные отели — до финального бронирования показываем только принцип. */
  namedHotels: false,
} as const;
