// Утилиты форматирования. Используются в карточках, корзине, заказе.

/**
 * Форматирует цену в сумах с разделителем тысяч.
 * 55000 → "55 000 сум"
 */
export function formatPrice(value) {
    if (value == null || Number.isNaN(Number(value))) return '';
    return `${Number(value).toLocaleString('ru-RU')} сум`;
}

/**
 * Форматирует вес/объём. Если пусто — возвращает пустую строку.
 */
export function formatWeight(value) {
    return value ? String(value) : '';
}

/**
 * Склонение слова "товар" по числу (1 товар / 2 товара / 5 товаров).
 */
export function pluralize(count, one, few, many) {
    const n = Math.abs(Number(count)) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return many;
    if (n1 > 1 && n1 < 5) return few;
    if (n1 === 1) return one;
    return many;
}