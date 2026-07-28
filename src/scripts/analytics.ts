/**
 * Аналитика через абстракцию: события собираются здесь и уходят в провайдера
 * только если он реально подключён. Никакой внешний трекер сам по себе
 * не загружается — за это отвечает разметка счётчика в Base.astro.
 */

export type AnalyticsEvent =
  | 'hero_cta_click'
  | 'route_cta_click'
  | 'bike_price_cta'
  | 'van_price_cta'
  | 'retreat_cta'
  | 'lead_form_open'
  | 'lead_form_submit'
  | 'leader_click'
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
    el.addEventListener('click', () => track(el.dataset.analytics!));
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
