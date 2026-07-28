/**
 * Отправка заявки.
 *
 * Адрес приёмника берётся из переменной окружения PUBLIC_LEAD_WEBHOOK_URL.
 * Если она не задана, форма не ломается: в разработке пишем в консоль и
 * показываем успех, в продакшене сообщаем, что приём заявок не настроен.
 *
 * Никаких ключей и секретов на фронтенде: вебхук должен быть приёмником,
 * который сам решает, что делать с заявкой (Telegram-бот, GetCourse,
 * Google Sheet, CRM). Чтобы подключить другой приёмник, достаточно
 * поменять адрес — разметку и логику формы трогать не нужно.
 */

export interface Lead {
  name: string;
  contact: string;
  email?: string;
  mode: 'motorcycle' | 'road' | 'unsure';
  island: 'yes' | 'no' | 'unsure';
  comment?: string;
  /** Служебные поля — откуда пришла заявка. */
  page: string;
  referrer: string;
}

export type LeadResult = { ok: true; mocked: boolean } | { ok: false; reason: string };

const WEBHOOK = import.meta.env.PUBLIC_LEAD_WEBHOOK_URL as string | undefined;

export async function submitLead(lead: Lead): Promise<LeadResult> {
  if (!WEBHOOK) {
    if (import.meta.env.DEV) {
      console.info('[lead] PUBLIC_LEAD_WEBHOOK_URL не задан — заявка не отправлена:', lead);
      return { ok: true, mocked: true };
    }
    return { ok: false, reason: 'not-configured' };
  }

  try {
    const res = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    if (!res.ok) return { ok: false, reason: `http-${res.status}` };
    return { ok: true, mocked: false };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
