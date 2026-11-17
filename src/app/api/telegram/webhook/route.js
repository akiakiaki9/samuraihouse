import { NextResponse } from 'next/server';
import { categories, dishes } from '@/data/menu';
import { orderMenuCategories } from '@/data/menu-category-order';
import { site } from '@/config/site';
import { getOrder, saveOrder, setMessageInfo, updateOrderStatus } from '@/lib/orderStore';
import { validateOrder } from '@/lib/validators';
import {
    answerCallback,
    editMessage,
    isTelegramConfigured,
    sendMessage,
    sendPhoto,
    sendOrderToTelegram,
} from '@/lib/telegram';
import { getTelegramSession } from '@/lib/telegramSessionStore';

const ALL_CATEGORIES_BUTTON = '📚 Все категории';
const CATEGORY_BUTTON_PREFIX = '← Назад к категории: ';
const CATEGORY_PAGE_SIZE = 8;
const CATEGORY_BUTTON = '📚 Категории';
const CART_BUTTON = '🛒 Корзина';
const CHECKOUT_BUTTON = '✅ Оформить заказ';
const CLEAR_CART_BUTTON = '🗑 Очистить корзину';
const CANCEL_BUTTON = '❌ Отмена';
const DELIVERY_BUTTON = '🚚 Доставка';
const PICKUP_BUTTON = '🏪 Самовывоз';
const NO_COMMENT_BUTTON = 'Без комментария';
const CONTACT_BUTTON = '📱 Отправить номер телефона';
const LOCATION_BUTTON = '📍 Отправить геолокацию';
const INFO_BUTTON_PREFIX = 'ℹ️ ';
const ADD_BUTTON_PREFIX = '➕ ';
const REMOVE_BUTTON_PREFIX = '➖ ';
const PREVIOUS_PAGE_BUTTON = '⬅️ Предыдущая страница';
const NEXT_PAGE_BUTTON = '➡️ Следующая страница';
const ORDER_CONFIRM_BUTTON = '✅ Подтвердить заказ';

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
        const text = (update.message.text || '').trim();
        const sessionKey = `${chatId}:${update.message.from?.id ?? chatId}`;
        const session = getTelegramSession(sessionKey);
        const command = text.split(/\s+/, 1)[0].split('@', 1)[0];

        if (session.checkout) {
            await handleCheckoutMessage(chatId, session, update.message, text);
            return NextResponse.json({ ok: true });
        }

        if (command === '/start' || command === '/menu' || text === ALL_CATEGORIES_BUTTON) {
            session.currentCategoryId = null;
            await sendCategoryList(chatId, session);
            return NextResponse.json({ ok: true });
        }

        if (command === '/cart' || text === CART_BUTTON) {
            await sendCart(chatId, session);
            return NextResponse.json({ ok: true });
        }

        if (command === '/order' || text === CHECKOUT_BUTTON) {
            await startCheckout(chatId, session);
            return NextResponse.json({ ok: true });
        }

        if (text === CATEGORY_BUTTON) {
            session.currentCategoryId = null;
            await sendCategoryList(chatId, session);
            return NextResponse.json({ ok: true });
        }

        if (text === CLEAR_CART_BUTTON) {
            session.cart.clear();
            await sendMessage(chatId, 'Корзина очищена.', buildMainKeyboard());
            return NextResponse.json({ ok: true });
        }

        if (text === PREVIOUS_PAGE_BUTTON || text === NEXT_PAGE_BUTTON) {
            const category = categories.find((item) => item.id === session.currentCategoryId);
            if (!category) {
                await sendCategoryList(chatId, session);
                return NextResponse.json({ ok: true });
            }
            const categoryDishes = dishes.filter((dish) => dish.categoryId === category.id);
            const pageCount = Math.ceil(categoryDishes.length / CATEGORY_PAGE_SIZE);
            const direction = text === NEXT_PAGE_BUTTON ? 1 : -1;
            session.currentPage = Math.max(0, Math.min(pageCount - 1, session.currentPage + direction));
            await sendCategoryMenu(chatId, session, category, session.currentPage);
            return NextResponse.json({ ok: true });
        }

        if (text.startsWith(ADD_BUTTON_PREFIX) || text.startsWith(REMOVE_BUTTON_PREFIX)) {
            const isRemoval = text.startsWith(REMOVE_BUTTON_PREFIX);
            const prefix = isRemoval ? REMOVE_BUTTON_PREFIX : ADD_BUTTON_PREFIX;
            const dish = findDishByButtonLabel(text.slice(prefix.length));
            if (dish) {
                const updated = updateCart(session, dish, isRemoval ? -1 : 1);
                if (!updated) {
                    const errorMessage = Number.isFinite(dish.price) && dish.price > 0
                        ? 'В корзине можно разместить не более 50 разных блюд.'
                        : 'Эту позицию пока нельзя заказать: цена уточняется.';
                    await sendMessage(chatId, errorMessage, buildCartKeyboardFromSession(session));
                    return NextResponse.json({ ok: true });
                }
                await sendCart(chatId, session);
            } else {
                await sendMessage(chatId, 'Не удалось найти блюдо. Откройте меню и выберите его снова.', buildMainKeyboard());
            }
            return NextResponse.json({ ok: true });
        }

        if (text.startsWith(INFO_BUTTON_PREFIX)) {
            const dish = findDishByButtonLabel(text.slice(INFO_BUTTON_PREFIX.length));
            if (dish) {
                await sendDishDetails(chatId, session, dish);
                return NextResponse.json({ ok: true });
            }
        }

        if (text === CANCEL_BUTTON) {
            session.checkout = null;
            await sendMessage(chatId, 'Оформление заказа отменено.', buildMainKeyboard());
            return NextResponse.json({ ok: true });
        }

        const backCategoryName = text.startsWith(CATEGORY_BUTTON_PREFIX)
            ? text.slice(CATEGORY_BUTTON_PREFIX.length)
            : null;
        const category = categories.find((item) => item.name === (backCategoryName || text));
        if (category) {
            session.currentCategoryId = category.id;
            const page = backCategoryName ? session.currentPage : 0;
            await sendCategoryMenu(chatId, session, category, page);
            return NextResponse.json({ ok: true });
        }

        const dish = findDishByButtonLabel(text);
        if (dish) {
            await sendDishDetails(chatId, session, dish);
            return NextResponse.json({ ok: true });
        }

        await sendCategoryList(chatId, session);
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

    const sessionKey = `${chatId}:${cq.from?.id ?? chatId}`;
    const session = getTelegramSession(sessionKey);

    // Устаревшие inline-кнопки меню переводят чат на клавиатуру бота.
    if (action === 'cat') {
        const categoryId = rest[0];
        const category = categories.find((c) => c.id === categoryId);
        const categoryDishes = dishes.filter((d) => d.categoryId === categoryId);

        if (!category || categoryDishes.length === 0) {
            await answerCallback(cq.id, 'Категория пуста');
            return NextResponse.json({ ok: true });
        }

        session.currentCategoryId = category.id;
        session.currentPage = 0;
        await sendCategoryMenu(chatId, session, category, 0);
        await answerCallback(cq.id);
        return NextResponse.json({ ok: true });
    }

    if (action === 'dish') {
        const dishId = rest[0];
        const dish = dishes.find((d) => d.id === dishId);
        if (!dish) {
            await answerCallback(cq.id, 'Блюдо не найдено');
            return NextResponse.json({ ok: true });
        }

        await sendDishDetails(chatId, session, dish);
        await answerCallback(cq.id);
        return NextResponse.json({ ok: true });
    }

    if (action === 'back' && rest[0] === 'cats') {
        await sendCategoryList(chatId, session);
        await answerCallback(cq.id);
        return NextResponse.json({ ok: true });
    }

    await answerCallback(cq.id);
    return NextResponse.json({ ok: true });
}

async function sendCategoryList(chatId, session) {
    session.currentCategoryId = null;
    session.currentPage = 0;
    await sendMessage(
        chatId,
        `🍣 <b>SAMURAI HOUSE</b>\n\nВ меню ${dishes.length} блюд. Выберите категорию:`,
        buildCategoriesReplyKeyboard()
    );
}

async function sendCategoryMenu(chatId, session, category, page) {
    const categoryDishes = dishes.filter((dish) => dish.categoryId === category.id);
    if (categoryDishes.length === 0) {
        await sendMessage(chatId, 'Категория пуста', buildCategoriesReplyKeyboard());
        return;
    }

    const pageCount = Math.ceil(categoryDishes.length / CATEGORY_PAGE_SIZE);
    const currentPage = Math.max(0, Math.min(pageCount - 1, page));
    const shown = categoryDishes.slice(
        currentPage * CATEGORY_PAGE_SIZE,
        (currentPage + 1) * CATEGORY_PAGE_SIZE
    );
    session.currentCategoryId = category.id;
    session.currentPage = currentPage;
    const text = [
        `📂 <b>${escapeHtml(category.name)}</b>`,
        '',
        `Страница ${currentPage + 1} из ${pageCount} · всего блюд: ${categoryDishes.length}`,
        '',
        ...shown.map((dish, index) => {
            const number = currentPage * CATEGORY_PAGE_SIZE + index + 1;
            const weight = dish.weight ? ` · ${escapeHtml(dish.weight)}` : '';
            return `${number}. <b>${escapeHtml(dish.name)}</b> — ${formatDishPrice(dish)}${weight}`;
        }),
        '',
        'Нажмите блюдо на клавиатуре, чтобы открыть карточку.',
    ].filter(Boolean).join('\n');

    await sendMessage(
        chatId,
        text,
        buildCategoryReplyKeyboard(shown, currentPage, pageCount)
    );
}

async function sendDishDetails(chatId, session, dish) {
    const category = categories.find((item) => item.id === dish.categoryId);
    session.currentCategoryId = category.id;
    const text = [
        `🍣 <b>${escapeHtml(dish.name)}</b>`,
        '',
        `<b>Категория:</b> ${escapeHtml(category.name)}`,
        `<b>Цена:</b> ${formatDishPrice(dish)}`,
        dish.weight ? `<b>Вес:</b> ${escapeHtml(dish.weight)}` : '',
        `<b>Описание:</b> ${dish.description ? escapeHtml(dish.description) : 'в меню не указано'}`,
        Number.isFinite(dish.price) && dish.price > 0
            ? ''
            : 'Позиция временно недоступна для заказа: цена уточняется.',
    ].filter(Boolean).join('\n');

    const keyboard = buildDishKeyboard(dish, category);
    const photoUrl = new URL(dish.image, site.url || 'https://www.samuraihouse.uz').toString();
    try {
        const sent = await sendPhoto(chatId, photoUrl, text, keyboard);
        if (sent) return;
    } catch (error) {
        console.error('[telegram] failed to send menu image:', error);
    }
    await sendMessage(chatId, text, keyboard);
}

function buildCategoriesReplyKeyboard() {
    const orderedCategories = orderMenuCategories(categories);
    const rows = [];
    for (let i = 0; i < orderedCategories.length; i += 2) {
        rows.push(
            orderedCategories.slice(i, i + 2).map(({ name }) => ({ text: name }))
        );
    }
    rows.push([{ text: CART_BUTTON }, { text: CHECKOUT_BUTTON }]);
    return buildReplyKeyboard(rows);
}

function buildCategoryReplyKeyboard(categoryDishes, page, pageCount) {
    const rows = [];
    for (let i = 0; i < categoryDishes.length; i += 2) {
        rows.push(
            categoryDishes.slice(i, i + 2).map((dish) => ({
                text: `${INFO_BUTTON_PREFIX}${getDishButtonLabel(dish)}`,
            }))
        );
    }
    const pageButtons = [];
    if (page > 0) pageButtons.push({ text: PREVIOUS_PAGE_BUTTON });
    if (page < pageCount - 1) pageButtons.push({ text: NEXT_PAGE_BUTTON });
    if (pageButtons.length) rows.push(pageButtons);
    rows.push([{ text: CATEGORY_BUTTON }, { text: CART_BUTTON }]);
    rows.push([{ text: CHECKOUT_BUTTON }]);
    return buildReplyKeyboard(rows);
}

function buildDishKeyboard(dish, category) {
    const rows = [];
    if (Number.isFinite(dish.price) && dish.price > 0) {
        rows.push([{ text: `${ADD_BUTTON_PREFIX}${getDishButtonLabel(dish)}` }]);
    }
    rows.push([{ text: `${CATEGORY_BUTTON_PREFIX}${category.name}` }]);
    rows.push([{ text: CATEGORY_BUTTON }, { text: CART_BUTTON }]);
    rows.push([{ text: CHECKOUT_BUTTON }]);
    return buildReplyKeyboard(rows);
}

async function sendCart(chatId, session) {
    const cartItems = [...session.cart.entries()]
        .map(([id, qty]) => ({ dish: dishes.find((item) => item.id === id), qty }))
        .filter((item) => item.dish);

    if (cartItems.length === 0) {
        await sendMessage(chatId, '🛒 Корзина пуста. Откройте меню и добавьте блюда.', buildMainKeyboard());
        return;
    }

    const totalCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.dish.price * item.qty,
        0
    );
    const text = [
        '🛒 <b>Ваша корзина</b>',
        '',
        ...cartItems.map(({ dish, qty }) => (
            `• ${escapeHtml(dish.name)} — ${qty} × ${formatPrice(dish.price)} = <b>${formatPrice(dish.price * qty)}</b>`
        )),
        '',
        `Позиций: ${cartItems.length} · блюд: ${totalCount}`,
        `<b>Итого: ${formatPrice(totalPrice)}</b>`,
        '',
        'Используйте кнопки +/−, чтобы изменить количество.',
    ].join('\n');

    await sendMessage(chatId, text, buildCartKeyboard(cartItems));
}

function buildCartKeyboard(cartItems) {
    const rows = cartItems.map(({ dish }) => [
        { text: `${REMOVE_BUTTON_PREFIX}${getDishButtonLabel(dish)}` },
        { text: `${ADD_BUTTON_PREFIX}${getDishButtonLabel(dish)}` },
    ]);
    rows.push([{ text: CATEGORY_BUTTON }, { text: CLEAR_CART_BUTTON }]);
    rows.push([{ text: CHECKOUT_BUTTON }]);
    return buildReplyKeyboard(rows);
}

function updateCart(session, dish, difference) {
    if (!Number.isFinite(dish.price) || dish.price <= 0) return false;
    if (difference > 0 && !session.cart.has(dish.id) && session.cart.size >= 50) return false;
    const quantity = Math.min(99, (session.cart.get(dish.id) || 0) + difference);
    if (quantity <= 0) {
        session.cart.delete(dish.id);
    } else {
        session.cart.set(dish.id, quantity);
    }
    return true;
}

async function startCheckout(chatId, session) {
    if (session.cart.size === 0) {
        await sendMessage(chatId, 'Корзина пуста. Сначала добавьте блюда из меню.', buildMainKeyboard());
        return;
    }
    if (!isTelegramConfigured()) {
        await sendMessage(chatId, 'Оформление заказа временно недоступно. Попробуйте позже.', buildCartKeyboardFromSession(session));
        return;
    }

    session.checkout = {
        step: 'name',
        name: '',
        phone: '',
        orderType: '',
        address: '',
        comment: '',
    };
    await sendMessage(chatId, 'Оформление заказа · Шаг 1 из 5\n\nВведите ваше имя:', buildCheckoutKeyboard('name'));
}

async function handleCheckoutMessage(chatId, session, message, text) {
    const checkout = session.checkout;
    if (text === CANCEL_BUTTON) {
        session.checkout = null;
        await sendCart(chatId, session);
        return;
    }

    if (checkout.step === 'name') {
        const name = text.trim();
        if (name.length < 2 || name.length > 60) {
            await sendMessage(chatId, 'Введите имя длиной от 2 до 60 символов:', buildCheckoutKeyboard('name'));
            return;
        }
        checkout.name = name;
        checkout.step = 'phone';
        await sendMessage(chatId, 'Шаг 2 из 5\n\nВведите номер телефона или отправьте его кнопкой:', buildCheckoutKeyboard('phone'));
        return;
    }

    if (checkout.step === 'phone') {
        const phone = message.contact?.phone_number || text;
        if (phone.replace(/\D/g, '').length < 9) {
            await sendMessage(chatId, 'Не удалось распознать номер. Введите телефон ещё раз:', buildCheckoutKeyboard('phone'));
            return;
        }
        checkout.phone = phone;
        checkout.step = 'orderType';
        await sendMessage(chatId, 'Шаг 3 из 5\n\nВыберите способ получения:', buildCheckoutKeyboard('orderType'));
        return;
    }

    if (checkout.step === 'orderType') {
        if (text === DELIVERY_BUTTON) {
            checkout.orderType = 'delivery';
            checkout.step = 'address';
            await sendMessage(chatId, 'Шаг 4 из 5\n\nВведите адрес или отправьте геолокацию:', buildCheckoutKeyboard('address'));
            return;
        }
        if (text === PICKUP_BUTTON) {
            checkout.orderType = 'pickup';
            checkout.address = '';
            checkout.step = 'comment';
            await sendMessage(chatId, 'Шаг 5 из 5\n\nДобавьте комментарий или выберите «Без комментария».', buildCheckoutKeyboard('comment'));
            return;
        }
        await sendMessage(chatId, 'Выберите доставку или самовывоз кнопкой:', buildCheckoutKeyboard('orderType'));
        return;
    }

    if (checkout.step === 'address') {
        if (text === LOCATION_BUTTON) {
            await sendMessage(chatId, 'Нажмите на 📎 и выберите «Геопозиция» либо введите адрес текстом.', buildCheckoutKeyboard('address'));
            return;
        }
        const address = message.location
            ? `https://maps.google.com/?q=${message.location.latitude},${message.location.longitude}`
            : text;
        if (address.trim().length < 5 || address.length > 200) {
            await sendMessage(chatId, 'Адрес должен содержать от 5 до 200 символов. Введите адрес или отправьте геолокацию:', buildCheckoutKeyboard('address'));
            return;
        }
        checkout.address = address;
        checkout.step = 'comment';
        await sendMessage(chatId, 'Шаг 5 из 5\n\nДобавьте комментарий или выберите «Без комментария».', buildCheckoutKeyboard('comment'));
        return;
    }

    if (checkout.step === 'comment') {
        const comment = text === NO_COMMENT_BUTTON ? '' : text;
        if (comment.length > 300) {
            await sendMessage(chatId, 'Комментарий должен быть не длиннее 300 символов:', buildCheckoutKeyboard('comment'));
            return;
        }
        checkout.comment = comment;
        checkout.step = 'confirm';
        await sendOrderReview(chatId, session);
        return;
    }

    if (checkout.step === 'confirm' && text === ORDER_CONFIRM_BUTTON) {
        await submitTelegramOrder(chatId, session);
        return;
    }

    await sendOrderReview(chatId, session);
}

async function sendOrderReview(chatId, session) {
    const checkout = session.checkout;
    const cartItems = [...session.cart.entries()]
        .map(([id, qty]) => ({ dish: dishes.find((item) => item.id === id), qty }))
        .filter((item) => item.dish);
    const total = cartItems.reduce((sum, item) => sum + item.dish.price * item.qty, 0);
    const lines = [
        'Проверьте заказ:',
        '',
        ...cartItems.map(({ dish, qty }) => (
            `• ${escapeHtml(dish.name)} — ${qty} × ${formatPrice(dish.price)}`
        )),
        '',
        `<b>Итого:</b> ${formatPrice(total)}`,
        `<b>Имя:</b> ${escapeHtml(checkout.name)}`,
        `<b>Телефон:</b> ${escapeHtml(checkout.phone)}`,
        `<b>Получение:</b> ${checkout.orderType === 'delivery' ? 'Доставка' : 'Самовывоз'}`,
        checkout.address ? `<b>Адрес:</b> ${escapeHtml(checkout.address)}` : '',
        checkout.comment ? `<b>Комментарий:</b> ${escapeHtml(checkout.comment)}` : '',
    ].filter(Boolean);

    await sendMessage(chatId, lines.join('\n'), buildCheckoutKeyboard('confirm'));
}

async function submitTelegramOrder(chatId, session) {
    const checkout = session.checkout;
    const validation = validateOrder({
        ...checkout,
        items: [...session.cart].map(([id, qty]) => ({ id, qty })),
    });

    if (!validation.ok) {
        session.checkout = null;
        await sendMessage(
            chatId,
            `Не удалось проверить заказ: ${escapeHtml(Object.values(validation.errors).join('. '))}`,
            buildCartKeyboardFromSession(session)
        );
        return;
    }

    const orderId = generateOrderId();
    saveOrder(orderId, validation.data);
    try {
        const messageInfo = await sendOrderToTelegram(validation.data, orderId);
        setMessageInfo(orderId, messageInfo);
    } catch (error) {
        console.error('[telegram] failed to submit bot order:', error);
        await sendMessage(
            chatId,
            'Не получилось отправить заказ. Нажмите «Подтвердить заказ», чтобы попробовать снова.',
            buildCheckoutKeyboard('confirm')
        );
        return;
    }

    session.cart.clear();
    session.checkout = null;
    session.currentCategoryId = null;
    await sendMessage(
        chatId,
        `✅ Заказ №${escapeHtml(orderId)} отправлен. Администратор свяжется с вами для подтверждения.`,
        buildMainKeyboard()
    );
}

function buildCheckoutKeyboard(step) {
    const rows = [];
    if (step === 'phone') {
        rows.push([{ text: CONTACT_BUTTON, request_contact: true }]);
    } else if (step === 'orderType') {
        rows.push([{ text: DELIVERY_BUTTON }, { text: PICKUP_BUTTON }]);
    } else if (step === 'address') {
        rows.push([{ text: LOCATION_BUTTON, request_location: true }]);
    } else if (step === 'comment') {
        rows.push([{ text: NO_COMMENT_BUTTON }]);
    } else if (step === 'confirm') {
        rows.push([{ text: ORDER_CONFIRM_BUTTON }]);
    }
    rows.push([{ text: CANCEL_BUTTON }]);
    return buildReplyKeyboard(rows);
}

function buildMainKeyboard() {
    return buildCategoriesReplyKeyboard();
}

function buildCartKeyboardFromSession(session) {
    const cartItems = [...session.cart.entries()]
        .map(([id, qty]) => ({ dish: dishes.find((item) => item.id === id), qty }))
        .filter((item) => item.dish);
    return cartItems.length ? buildCartKeyboard(cartItems) : buildMainKeyboard();
}

function findDishByButtonLabel(label) {
    return dishes.find((dish) => getDishButtonLabel(dish) === label) || null;
}

function generateOrderId() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `TG-${timestamp}-${suffix}`;
}

function formatDishPrice(dish) {
    return Number.isFinite(dish.price) && dish.price > 0
        ? formatPrice(dish.price)
        : 'цена уточняется';
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function buildReplyKeyboard(keyboard) {
    return {
        keyboard,
        resize_keyboard: true,
        is_persistent: true,
    };
}

function getDishButtonLabel(dish) {
    const baseLabel = `${dish.name} — ${
        Number.isFinite(dish.price) ? formatPrice(dish.price) : 'цена уточняется'
    }`;
    const matchingDishes = dishes.filter((item) => (
        `${item.name} — ${
            Number.isFinite(item.price) ? formatPrice(item.price) : 'цена уточняется'
        }` === baseLabel
    ));

    if (matchingDishes.length < 2) return baseLabel;
    return `${baseLabel} (${matchingDishes.findIndex((item) => item.id === dish.id) + 1})`;
}

function formatPrice(n) {
    return `${Number(n).toLocaleString('ru-RU')} сум`;
}