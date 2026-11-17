const TELEGRAM_API = 'https://api.telegram.org';

export function isTelegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

function formatPrice(n) {
  return `${Number(n).toLocaleString('ru-RU')} сум`;
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ---------- Отправка заказа (сайт → админ) ---------- */

export async function sendOrderToTelegram(order, orderId) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error('Telegram не настроен');

  const lines = [
    `<b>Новый заказ №${escapeHtml(orderId)}</b>`,
    '',
    `<b>Тип:</b> ${order.orderType === 'delivery' ? 'Доставка' : 'Самовывоз'}`,
    `<b>Имя:</b> ${escapeHtml(order.name)}`,
    `<b>Телефон:</b> ${escapeHtml(order.phone)}`,
  ];
  if (order.orderType === 'delivery' && order.address) lines.push(`<b>Адрес:</b> ${escapeHtml(order.address)}`);
  if (order.comment) lines.push(`<b>Комментарий:</b> ${escapeHtml(order.comment)}`);
  lines.push('', '<b>Состав:</b>');
  order.items.forEach((it) => {
    lines.push(`• ${escapeHtml(it.name)} — ${it.qty} × ${formatPrice(it.price)} = <b>${formatPrice(it.lineTotal)}</b>`);
  });
  lines.push('', `<b>Итого:</b> ${formatPrice(order.totalPrice)}`);

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Принять', callback_data: `accept:${orderId}` },
        { text: '❌ Отклонить', callback_data: `reject:${orderId}` },
      ],
    ],
  };

  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines.join('\n'),
      parse_mode: 'HTML',
      reply_markup: keyboard,
    }),
  });

  if (!res.ok) throw new Error('Telegram sendMessage failed');
  const json = await res.json();
  return { messageId: json.result.message_id, chatId };
}

/* ---------- Редактирование сообщения ---------- */

export async function editMessage(chatId, messageId, text, replyMarkup) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  const body = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
  };
  if (replyMarkup) body.reply_markup = replyMarkup;

  const res = await fetch(`${TELEGRAM_API}/bot${token}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    if (err.includes('message is not modified')) return true;
    console.error('[telegram] edit failed:', err.slice(0, 200));
    return false;
  }
  return true;
}

/* ---------- Ответ на callback (убирает "крутилку") ---------- */

export async function answerCallback(callbackQueryId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`${TELEGRAM_API}/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  }).catch(() => { });
}

/* ---------- Отправка простого сообщения ---------- */

export async function sendMessage(chatId, text, replyMarkup) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  const body = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (replyMarkup) body.reply_markup = replyMarkup;
  await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => { });
}

export async function sendPhoto(chatId, photo, caption, replyMarkup) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  const body = {
    chat_id: chatId,
    photo,
    caption,
    parse_mode: 'HTML',
    reply_markup: replyMarkup,
  };
  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await res.json();
  if (!res.ok || !result.ok) {
    console.error('[telegram] sendPhoto failed:', result.description || res.status);
    return false;
  }
  return true;
}