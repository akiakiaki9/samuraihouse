// Серверный модуль. In-memory хранилище заказов.
const orders = new Map();

export function saveOrder(orderId, order, { messageId = null, chatId = null } = {}) {
    orders.set(orderId, {
        order,
        status: 'new',
        updatedAt: Date.now(),
        messageId,
        chatId,
    });
}

export function getOrder(orderId) {
    return orders.get(orderId) || null;
}

export function updateOrderStatus(orderId, status) {
    const rec = orders.get(orderId);
    if (!rec) return { ok: false, reason: 'not_found' };
    rec.status = status;
    rec.updatedAt = Date.now();
    return { ok: true, record: rec };
}

export function setMessageInfo(orderId, { messageId, chatId }) {
    const rec = orders.get(orderId);
    if (!rec) return;
    rec.messageId = messageId;
    rec.chatId = chatId;
}