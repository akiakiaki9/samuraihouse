// Серверная валидация заказа.
// Возвращает { ok: true, data } или { ok: false, errors: {...} }.

import { getDishById } from '@/data/menu';

const NAME_MIN = 2;
const NAME_MAX = 60;
const PHONE_MIN_DIGITS = 9;
const ADDRESS_MIN = 5;
const ADDRESS_MAX = 200;
const COMMENT_MAX = 300;
const MAX_LINES = 50;
const MAX_QTY_PER_LINE = 99;

export function validateOrder(body) {
    const errors = {};

    if (!body || typeof body !== 'object') {
        return { ok: false, errors: { _form: 'Некорректные данные заказа' } };
    }

    // Имя
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length < NAME_MIN) {
        errors.name = 'Укажите имя (минимум 2 символа)';
    } else if (name.length > NAME_MAX) {
        errors.name = `Слишком длинное имя (максимум ${NAME_MAX})`;
    }

    // Телефон
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < PHONE_MIN_DIGITS) {
        errors.phone = 'Укажите корректный номер телефона';
    }

    // Тип заказа
    const orderType = body.orderType;
    if (orderType !== 'delivery' && orderType !== 'pickup') {
        errors.orderType = 'Выберите тип заказа';
    }

    // Адрес (только для доставки)
    let address = '';
    if (orderType === 'delivery') {
        address = typeof body.address === 'string' ? body.address.trim() : '';
        if (address.length < ADDRESS_MIN) {
            errors.address = 'Укажите адрес доставки';
        } else if (address.length > ADDRESS_MAX) {
            errors.address = `Слишком длинный адрес (максимум ${ADDRESS_MAX})`;
        }
    }

    // Комментарий (опционально)
    let comment = '';
    if (body.comment != null) {
        comment = String(body.comment).trim();
        if (comment.length > COMMENT_MAX) {
            errors.comment = `Комментарий слишком длинный (максимум ${COMMENT_MAX})`;
        }
    }

    // Позиции
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
        errors.items = 'Корзина пуста';
    } else if (rawItems.length > MAX_LINES) {
        errors.items = 'Слишком много позиций в заказе';
    }

    const items = [];
    if (!errors.items) {
        for (const it of rawItems) {
            const id = it && typeof it.id === 'string' ? it.id : null;
            const qty = it && Number.isInteger(it.qty) ? it.qty : 0;
            const dish = id ? getDishById(id) : null;

            if (!dish) {
                errors.items = 'В заказе есть неизвестное блюдо';
                break;
            }
            if (!Number.isFinite(dish.price) || dish.price <= 0) {
                errors.items = 'В заказе есть блюдо без указанной цены';
                break;
            }
            if (qty <= 0 || qty > MAX_QTY_PER_LINE) {
                errors.items = 'Некорректное количество в позиции';
                break;
            }
            items.push({
                id: dish.id,
                name: dish.name,
                price: dish.price, // берём с сервера, не с клиента
                qty,
                weight: dish.weight || null,
                lineTotal: dish.price * qty,
            });
        }
    }

    // Итог
    const totalPrice = items.reduce((s, it) => s + it.lineTotal, 0);
    const totalCount = items.reduce((s, it) => s + it.qty, 0);

    if (Object.keys(errors).length > 0) {
        return { ok: false, errors };
    }

    return {
        ok: true,
        data: {
            name,
            phone,
            orderType,
            address: orderType === 'delivery' ? address : '',
            comment,
            items,
            totalCount,
            totalPrice,
        },
    };
}