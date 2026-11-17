'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';
import { formatPrice } from '@/lib/format';

const initialForm = {
    name: '',
    phone: '',
    orderType: 'delivery',
    address: '',
    comment: '',
};

export default function OrderForm({ onClose }) {
    const { items, totalCount, totalPrice, clear } = useCart();
    const [form, setForm] = useState(initialForm);
    const [clientErrors, setClientErrors] = useState({});
    const [serverErrors, setServerErrors] = useState({});
    const [status, setStatus] = useState('idle'); // idle | submitting | success | error
    const [orderId, setOrderId] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState('');

    const setField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setClientErrors((prev) => ({ ...prev, [field]: undefined }));
        setServerErrors({});
    };

    const addCurrentLocation = () => {
        setLocationError('');
        if (!navigator.geolocation) {
            setLocationError('Геолокация не поддерживается этим браузером.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const coordinates = `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`;
                setField('address', `https://maps.google.com/?q=${coordinates}`);
                setIsLocating(false);
            },
            (error) => {
                const message = error.code === error.PERMISSION_DENIED
                    ? 'Разрешите доступ к геолокации или укажите адрес вручную.'
                    : 'Не удалось определить местоположение. Укажите адрес вручную.';
                setLocationError(message);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const validateClient = () => {
        const e = {};
        if (form.name.trim().length < 2) e.name = 'Укажите имя';
        const digits = form.phone.replace(/\D/g, '');
        if (digits.length < 9) e.phone = 'Укажите корректный телефон';
        if (form.orderType === 'delivery' && form.address.trim().length < 5) {
            e.address = 'Укажите адрес доставки';
        }
        setClientErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setServerErrors({});

        if (!validateClient()) return;
        if (items.length === 0) {
            setServerErrors({ _form: 'Корзина пуста' });
            return;
        }

        setStatus('submitting');

        const payload = {
            name: form.name,
            phone: form.phone,
            orderType: form.orderType,
            address: form.orderType === 'delivery' ? form.address : '',
            comment: form.comment,
            // Клиент отправляет только id + qty, цены пересчитает сервер
            items: items.map((it) => ({ id: it.id, qty: it.qty })),
        };

        try {
            const res = await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data.ok) {
                setServerErrors(data.errors || { _form: 'Не удалось отправить заказ' });
                setStatus('error');
                return;
            }

            setOrderId(data.orderId);
            setStatus('success');
            clear();
        } catch {
            setServerErrors({ _form: 'Сетевая ошибка. Проверьте соединение.' });
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="order-success">
                <div className="order-success__icon">✓</div>
                <h2 className="order-success__title">Заказ принят</h2>
                <p className="order-success__text">
                    Номер заказа: <strong>{orderId}</strong>
                </p>
                <p className="order-success__text">
                    Мы свяжемся с вами по указанному телефону для подтверждения.
                </p>
                <button type="button" className="btn btn--primary" onClick={onClose}>
                    Готово
                </button>
            </div>
        );
    }

    return (
        <form className="order-form" onSubmit={handleSubmit} noValidate>
            <h2 className="order-form__title">Оформление заказа</h2>

            <div className="order-form__field">
                <label htmlFor="name">Имя *</label>
                <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    autoComplete="name"
                    aria-invalid={Boolean(clientErrors.name || serverErrors.name)}
                />
                {(clientErrors.name || serverErrors.name) && (
                    <span className="order-form__error">
                        {clientErrors.name || serverErrors.name}
                    </span>
                )}
            </div>

            <div className="order-form__field">
                <label htmlFor="phone">Телефон *</label>
                <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    autoComplete="tel"
                    placeholder="+998 90 000 00 00"
                    aria-invalid={Boolean(clientErrors.phone || serverErrors.phone)}
                />
                {(clientErrors.phone || serverErrors.phone) && (
                    <span className="order-form__error">
                        {clientErrors.phone || serverErrors.phone}
                    </span>
                )}
            </div>

            <div className="order-form__field">
                <span className="order-form__label">Тип заказа *</span>
                <div className="order-form__radios">
                    <label className="order-form__radio">
                        <input
                            type="radio"
                            name="orderType"
                            value="delivery"
                            checked={form.orderType === 'delivery'}
                            onChange={() => setField('orderType', 'delivery')}
                        />
                        <span>Доставка</span>
                    </label>
                    <label className="order-form__radio">
                        <input
                            type="radio"
                            name="orderType"
                            value="pickup"
                            checked={form.orderType === 'pickup'}
                            onChange={() => setField('orderType', 'pickup')}
                        />
                        <span>Самовывоз</span>
                    </label>
                </div>
                {serverErrors.orderType && (
                    <span className="order-form__error">{serverErrors.orderType}</span>
                )}
            </div>

            {form.orderType === 'delivery' && (
                <div className="order-form__field">
                    <label htmlFor="address">Адрес или локация доставки *</label>
                    <input
                        id="address"
                        type="text"
                        value={form.address}
                        onChange={(e) => setField('address', e.target.value)}
                        autoComplete="street-address"
                        aria-invalid={Boolean(clientErrors.address || serverErrors.address)}
                    />
                    <button
                        type="button"
                        className="order-form__location"
                        onClick={addCurrentLocation}
                        disabled={isLocating}
                    >
                        {isLocating ? 'Определяем местоположение…' : 'Добавить моё местоположение'}
                    </button>
                    {locationError && (
                        <span className="order-form__error" role="status">{locationError}</span>
                    )}
                    {(clientErrors.address || serverErrors.address) && (
                        <span className="order-form__error">
                            {clientErrors.address || serverErrors.address}
                        </span>
                    )}
                </div>
            )}

            <div className="order-form__field">
                <label htmlFor="comment">Комментарий</label>
                <textarea
                    id="comment"
                    rows={3}
                    value={form.comment}
                    onChange={(e) => setField('comment', e.target.value)}
                    placeholder="Пожелания, подъезд, этаж и т.д."
                />
            </div>

            <div className="order-form__summary">
                <div className="order-form__summary-row">
                    <span>Позиций</span>
                    <span>{items.length}</span>
                </div>
                <div className="order-form__summary-row">
                    <span>Единиц</span>
                    <span>{totalCount}</span>
                </div>
                <div className="order-form__summary-row order-form__summary-row--total">
                    <span>Итого</span>
                    <strong>{formatPrice(totalPrice)}</strong>
                </div>
            </div>

            {(serverErrors._form || clientErrors._form) && (
                <div className="order-form__form-error">
                    {serverErrors._form || clientErrors._form}
                </div>
            )}

            <button
                type="submit"
                className="btn btn--primary order-form__submit"
                disabled={status === 'submitting' || items.length === 0}
            >
                {status === 'submitting' ? 'Отправляем…' : 'Подтвердить заказ'}
            </button>

            <p className="order-form__hint">
                Оплата — при получении или в зале. Онлайн-оплаты нет.
            </p>
        </form>
    );
}