/**
 * Аналитика через абстракцию: события собираются здесь и уходят в провайдера
 * только если он реально подключён. Никакой внешний трекер сам по себе
 * не загружается — за это отвечает разметка счётчика в Base.astro.
 */

/**
 * Полный перечень событий из ТЗ плюс те, что уже были в проекте.
 * Имена фиксированы: по ним настраиваются цели в аналитике, поэтому
 * переименовывать их без согласования нельзя.
 */
export type AnalyticsEvent =
  // первый экран и переходы к заявке
  | 'hero_cta_click'
  | 'price_cta_click'
  | 'route_cta_click'
  | 'retreat_cta'
  // раскрытие содержимого
  | 'route_point_open'
  | 'program_day_open'
  | 'bike_option_select'
  | 'island_details_click'
  | 'leader_click'
  // форма заявки
  | 'lead_form_start'
  | 'lead_form_open'
  | 'lead_form_submit'
  | 'lead_form_success'
  | 'lead_form_error'
  | 'telegram_click'
  // прежние имена ценовых кнопок — оставлены, чтобы не потерять уже
  // настроенные цели; новые кнопки шлют price_cta_click с параметром option
  | 'bike_price_cta'
  | 'van_price_cta'
  | 'route_day_open';

type Payload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Payload[];
    ym?: (id: number, action: string, ...rest: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: AnalyticsEvent | string, payload: Payload = {}): void {
  // Google Tag Manager / GA4
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event, ...payload });
  }
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, payload);
  }
  if (import.meta.env.DEV) {
    console.debug('[analytics]', event, payload);
  }
}

/** Навешивает отправку событий на элементы с data-analytics. */
export function bindAnalytics(): void {
  document.querySelectorAll<HTMLElement>('[data-analytics]').forEach((el) => {
    el.addEventListener('click', () => {
      track(el.dataset.analytics!);
      /*
       * Вторая метка на том же элементе. Нужна ценовым кнопкам: частное
       * событие (bike_price_cta / van_price_cta) уже заведено целью в
       * аналитике и терять его нельзя, а обобщающее price_cta_click из
       * пункта 8 ТЗ приходит с параметром option и считает обе колонки
       * одним отчётом.
       */
      if (el.dataset.analyticsAlso) {
        track(el.dataset.analyticsAlso, { option: el.dataset.analyticsOption });
      }
    });
  });

  /** Выбор формата участия в форме заявки: байк, микроавтобус, «ещё выбираю». */
  document.querySelectorAll<HTMLInputElement>('input[name="mode"]').forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) track('bike_option_select', { option: input.value });
    });
  });

  document.querySelectorAll<HTMLElement>('[data-analytics-leader]').forEach((el) => {
    el.addEventListener('click', () =>
      track('leader_click', { id: el.dataset.analyticsLeader }),
    );
  });

  // События, которые компоненты шлют через window
  window.addEventListener('analytics', (e) => {
    const detail = (e as CustomEvent<{ event: string } & Payload>).detail;
    if (detail?.event) {
      const { event, ...rest } = detail;
      track(event, rest);
    }
  });
}
