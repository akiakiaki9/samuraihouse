import { NextResponse } from 'next/server';
import { validateOrder } from '@/lib/validators';
import { sendOrderToTelegram, isTelegramConfigured } from '@/lib/telegram';
import { saveOrder, setMessageInfo } from '@/lib/orderStore';

function generateOrderId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${ts}-${rand}`;
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ ok: false, errors: { _form: 'Некорректный JSON' } }, { status: 400 });
  }

  const validation = validateOrder(body);
  if (!validation.ok) return NextResponse.json({ ok: false, errors: validation.errors }, { status: 422 });

  if (!isTelegramConfigured()) {
    return NextResponse.json({ ok: false, errors: { _form: 'Оформление временно недоступно' } }, { status: 503 });
  }

  const orderId = generateOrderId();
  saveOrder(orderId, validation.data);

  try {
    const { messageId, chatId } = await sendOrderToTelegram(validation.data, orderId);
    setMessageInfo(orderId, { messageId, chatId });
  } catch {
    return NextResponse.json({ ok: false, errors: { _form: 'Не удалось отправить заказ' } }, { status: 502 });
  }

  return NextResponse.json({ ok: true, orderId, totalPrice: validation.data.totalPrice, totalCount: validation.data.totalCount });
}