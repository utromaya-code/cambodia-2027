/**
 * Отправка заявки.
 *
 * Адрес приёмника берётся из trip.formEndpoint — то есть из переменной
 * окружения PUBLIC_LEAD_FORM_ENDPOINT (поддерживается и прежнее имя
 * PUBLIC_LEAD_WEBHOOK_URL). Держать адрес в одном месте важно, потому что
 * на него же смотрит проверка готовности контента на сборке.
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
  /** Метки рекламной кампании, если пользователь пришёл по ссылке с ними. */
  utm?: Record<string, string>;
}

const modeLabels: Record<Lead['mode'], string> = {
  motorcycle: 'на байке',
  road: 'на микроавтобусе',
  unsure: 'ещё выбирает',
};

const islandLabels: Record<Lead['island'], string> = {
  yes: 'интересен',
  no: 'только основной маршрут',
  unsure: 'ещё думает',
};

/** Собирает короткое, читаемое сообщение для передачи заявки в Telegram. */
export function buildTelegramLeadUrl(
  lead: Lead,
  telegramUrl = 'https://t.me/vsemaya',
): string {
  const lines = [
    'Новая заявка: Камбоджа 2027',
    '',
    `Имя: ${lead.name}`,
    `Контакт: ${lead.contact}`,
    lead.email ? `Email: ${lead.email}` : '',
    `Формат: ${modeLabels[lead.mode]}`,
    `Остров 8–15 марта: ${islandLabels[lead.island]}`,
    lead.comment ? `Комментарий: ${lead.comment}` : '',
    '',
    `Страница: ${lead.page}`,
  ].filter(Boolean);

  const separator = telegramUrl.includes('?') ? '&' : '?';
  return `${telegramUrl}${separator}text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Собирает utm_* из адресной строки.
 *
 * Читаем при отправке, а не при загрузке: пользователь мог пройти по якорям,
 * но параметры запроса при этом сохраняются.
 */
export function collectUtm(search: string = location.search): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of new URLSearchParams(search)) {
    if (key.startsWith('utm_') && value) out[key] = value;
  }
  return out;
}

export type LeadResult = { ok: true; mocked: boolean } | { ok: false; reason: string };

const WEBHOOK = (import.meta.env.PUBLIC_LEAD_FORM_ENDPOINT ??
  import.meta.env.PUBLIC_LEAD_WEBHOOK_URL) as string | undefined;

export async function submitLead(lead: Lead): Promise<LeadResult> {
  if (!WEBHOOK) {
    if (import.meta.env.DEV) {
      console.info('[lead] PUBLIC_LEAD_FORM_ENDPOINT не задан — заявка не отправлена:', lead);
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
