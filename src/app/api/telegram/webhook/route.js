import { NextResponse } from 'next/server';
import { categories, dishes } from '@/data/menu';
import { orderMenuCategories } from '@/data/menu-category-order';
import { getOrder, updateOrderStatus } from '@/lib/orderStore';
import { answerCallback, editMessage, sendMessage } from '@/lib/telegram';

export async function GET() {
    return NextResponse.json({ ok: true, service: 'telegram-webhook' });
}

export async function POST(request) {
    let update;
    try {
        update = await request.json();
    } catch {
        return NextResponse.json({ ok: true });
    }

    // --- Обработка текстовых сообщений (автоответчик) ---
    if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text || '';

        // На любое сообщение (или /start, /menu) показываем категории
        const keyboard = buildCategoriesKeyboard();
        await sendMessage(
            chatId,
            '🍣 <b>SAMURAI HOUSE</b>\n\nВыберите категорию меню:',
            keyboard
        );
        return NextResponse.json({ ok: true });
    }

    // --- Обработка нажатий inline-кнопок ---
    const cq = update.callback_query;
    if (!cq) return NextResponse.json({ ok: true });

    const data = cq.data || '';
    const [action, ...rest] = data.split(':');
    const chatId = cq.message.chat.id;
    const messageId = cq.message.message_id;

    // --- Кнопки заказа (accept/reject) ---
    if (action === 'accept' || action === 'reject') {
        const orderId = rest[0];
        const newStatus = action === 'accept' ? 'accepted' : 'rejected';
        const record = getOrder(orderId);

        if (!record) {
            await answerCallback(cq.id, 'Заказ не найден (сервер перезапущен)');
            return NextResponse.json({ ok: true });
        }

        updateOrderStatus(orderId, newStatus);
        const statusText = newStatus === 'accepted' ? '✅ Принят' : '❌ Отклонён';

        // Редактируем сообщение: добавляем статус сверху, убираем кнопки
        const lines = cq.message.text.split('\n');
        lines[0] = `<b>Заказ №${orderId}</b> — ${statusText}`;
        await editMessage(chatId, messageId, lines.join('\n'), null);

        await answerCallback(cq.id, statusText);
        return NextResponse.json({ ok: true });
    }

    // --- Категории → блюда ---
    if (action === 'cat') {
        const categoryId = rest[0];
        const category = categories.find((c) => c.id === categoryId);
        const categoryDishes = dishes.filter((d) => d.categoryId === categoryId);

        if (!category || categoryDishes.length === 0) {
            await answerCallback(cq.id, 'Категория пуста');
            return NextResponse.json({ ok: true });
        }

        // Список блюд (максимум 10, чтобы не превысить лимит)
        const shown = categoryDishes.slice(0, 10);
        const text = [
            `📂 <b>${category.name}</b>`,
            '',
            `Найдено блюд: ${categoryDishes.length}`,
            shown.length < categoryDishes.length ? `(показаны первые ${shown.length})` : '',
        ].filter(Boolean).join('\n');

        const keyboard = {
            inline_keyboard: [
                ...shown.map((d) => [
                    {
                        text: `${d.name} — ${formatPrice(d.price) || 'цена уточняется'}`,
                        callback_data: `dish:${d.id}`,
                    },
                ]),
                [{ text: '← Назад к категориям', callback_data: 'back:cats' }],
            ],
        };

        await editMessage(chatId, messageId, text, keyboard);
        await answerCallback(cq.id);
        return NextResponse.json({ ok: true });
    }

    // --- Блюдо → карточка ---
    if (action === 'dish') {
        const dishId = rest[0];
        const dish = dishes.find((d) => d.id === dishId);
        if (!dish) {
            await answerCallback(cq.id, 'Блюдо не найдено');
            return NextResponse.json({ ok: true });
        }

        const text = [
            `<b>${dish.name}</b>`,
            '',
            dish.description || '',
            '',
            `💰 <b>Цена:</b> ${formatPrice(dish.price) || 'уточняется'}`,
            dish.weight ? `⚖️ <b>Вес:</b> ${dish.weight}` : '',
        ].filter(Boolean).join('\n');

        const keyboard = {
            inline_keyboard: [
                [{ text: '← Назад к категории', callback_data: `cat:${dish.categoryId}` }],
                [{ text: '← Все категории', callback_data: 'back:cats' }],
            ],
        };

        await editMessage(chatId, messageId, text, keyboard);
        await answerCallback(cq.id);
        return NextResponse.json({ ok: true });
    }

    // --- Назад к категориям ---
    if (action === 'back' && rest[0] === 'cats') {
        await editMessage(
            chatId,
            messageId,
            '🍣 <b>SAMURAI HOUSE</b>\n\nВыберите категорию меню:',
            buildCategoriesKeyboard()
        );
        await answerCallback(cq.id);
        return NextResponse.json({ ok: true });
    }

    await answerCallback(cq.id);
    return NextResponse.json({ ok: true });
}

function buildCategoriesKeyboard() {
    // 17 категорий → 4 строки по 4-5 кнопок, чтобы влезло
    const rows = [];
    const orderedCategories = orderMenuCategories(categories);
    for (let i = 0; i < orderedCategories.length; i += 4) {
        rows.push(
            orderedCategories.slice(i, i + 4).map((c) => ({
                text: c.name,
                callback_data: `cat:${c.id}`,
            }))
        );
    }
    return { inline_keyboard: rows };
}

function formatPrice(n) {
    return `${Number(n).toLocaleString('ru-RU')} сум`;
}