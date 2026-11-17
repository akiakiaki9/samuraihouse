'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';
import DishImage from './ui/DishImage';
import OrderForm from './OrderForm';
import { formatPrice, formatWeight, pluralize } from '@/lib/format';

export default function CartDrawer() {
    const {
        items,
        isOpen,
        close,
        setQty,
        removeItem,
        clear,
        totalCount,
        totalPrice,
        isHydrated,
    } = useCart();

    const [step, setStep] = useState('cart'); // cart | checkout

    const closeCart = () => {
        setStep('cart');
        close();
    };

    return (
        <div
            className={`cart-drawer ${isOpen ? 'is-open' : ''}`}
            aria-hidden={!isOpen}
        >
            <button
                type="button"
                className="cart-drawer__backdrop"
                aria-label="Закрыть корзину"
                onClick={closeCart}
            />

            <aside
                className={`cart-drawer__panel${step === 'checkout' ? ' cart-drawer__panel--checkout' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label={step === 'checkout' ? 'Оформление заказа' : 'Корзина'}
            >
                {step === 'checkout' ? (
                    <div className="cart-drawer__checkout-wrap">
                        <header className="cart-drawer__head">
                            <button
                                type="button"
                                className="cart-drawer__back"
                                onClick={() => setStep('cart')}
                            >
                                ← Назад
                            </button>
                            <button
                                type="button"
                                className="cart-drawer__close"
                                aria-label="Закрыть"
                                onClick={closeCart}
                            >
                                ×
                            </button>
                        </header>
                        <div className="cart-drawer__checkout-body">
                            <OrderForm onClose={closeCart} />
                        </div>
                    </div>
                ) : (
                    <>
                        <header className="cart-drawer__head">
                            <div>
                                <span className="eyebrow">Корзина</span>
                                <h2 className="cart-drawer__title">
                                    {isHydrated && totalCount > 0
                                        ? `${totalCount} ${pluralize(
                                            totalCount,
                                            'товар',
                                            'товара',
                                            'товаров'
                                        )}`
                                        : 'Ваша корзина'}
                                </h2>
                            </div>
                            <button
                                type="button"
                                className="cart-drawer__close"
                                aria-label="Закрыть"
                                onClick={closeCart}
                            >
                                ×
                            </button>
                        </header>

                        {!isHydrated ? (
                            <div className="cart-drawer__empty">
                                <p>Загружаем корзину…</p>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="cart-drawer__empty">
                                <p className="cart-drawer__empty-title">Корзина пуста</p>
                                <p className="cart-drawer__empty-text">
                                    Добавьте блюда из меню — и они появятся здесь.
                                </p>
                                <Link href="/menu" className="btn btn--primary" onClick={closeCart}>
                                    Открыть меню
                                </Link>
                            </div>
                        ) : (
                            <>
                                <ul className="cart-drawer__list">
                                    {items.map((item) => (
                                        <li key={item.id} className="cart-item">
                                            <div className="cart-item__media">
                                                <DishImage
                                                    src={item.image}
                                                    alt={item.name}
                                                    sizes="72px"
                                                />
                                            </div>

                                            <div className="cart-item__info">
                                                <h3 className="cart-item__title">{item.name}</h3>
                                                {item.weight && (
                                                    <span className="cart-item__weight">
                                                        {formatWeight(item.weight)}
                                                    </span>
                                                )}
                                                <span className="cart-item__price">
                                                    {formatPrice(item.price)}
                                                </span>
                                            </div>

                                            <div className="cart-item__side">
                                                <div className="cart-qty">
                                                    <button
                                                        type="button"
                                                        aria-label="Уменьшить количество"
                                                        onClick={() => setQty(item.id, item.qty - 1)}
                                                    >
                                                        −
                                                    </button>
                                                    <span>{item.qty}</span>
                                                    <button
                                                        type="button"
                                                        aria-label="Увеличить количество"
                                                        onClick={() => setQty(item.id, item.qty + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="cart-item__remove"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <footer className="cart-drawer__foot">
                                    <div className="cart-drawer__total">
                                        <span>Итого</span>
                                        <strong>{formatPrice(totalPrice)}</strong>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn--primary cart-drawer__checkout"
                                        onClick={() => setStep('checkout')}
                                    >
                                        Оформить заказ
                                    </button>
                                    <button
                                        type="button"
                                        className="cart-drawer__clear"
                                        onClick={clear}
                                    >
                                        Очистить корзину
                                    </button>
                                </footer>
                            </>
                        )}
                    </>
                )}
            </aside>
        </div>
    );
}