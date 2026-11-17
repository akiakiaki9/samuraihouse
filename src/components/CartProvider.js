'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { getDishById } from '@/data/menu';

const STORAGE_KEY = 'samurai-house-cart-v1';

const CartContext = createContext(null);

function loadFromStorage() {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        // Оставляем только валидные позиции (блюдо существует, qty > 0)
        return parsed
            .filter((item) => {
                if (
                    !item ||
                    typeof item.id !== 'string' ||
                    !Number.isInteger(item.qty) ||
                    item.qty <= 0
                ) {
                    return false;
                }

                const dish = getDishById(item.id);
                return Number.isFinite(dish?.price) && dish.price > 0;
            })
            .map((item) => ({ id: item.id, qty: Math.min(item.qty, 99) }));
    } catch {
        return [];
    }
}

function reducer(state, action) {
    switch (action.type) {
        case 'ADD': {
            const { id, qty = 1 } = action;
            const dish = getDishById(id);
            if (!Number.isFinite(dish?.price) || dish.price <= 0) return state;
            const existing = state.find((it) => it.id === id);
            if (existing) {
                return state.map((it) =>
                    it.id === id ? { ...it, qty: Math.min(it.qty + qty, 99) } : it
                );
            }
            return [...state, { id, qty: Math.min(qty, 99) }];
        }
        case 'REMOVE':
            return state.filter((it) => it.id !== action.id);
        case 'SET_QTY': {
            const { id, qty } = action;
            if (!Number.isInteger(qty) || qty <= 0) {
                return state.filter((it) => it.id !== id);
            }
            return state.map((it) =>
                it.id === id ? { ...it, qty: Math.min(qty, 99) } : it
            );
        }
        case 'CLEAR':
            return [];
        case 'HYDRATE':
            return action.items;
        default:
            return state;
    }
}

export function CartProvider({ children }) {
    const [items, dispatch] = useReducer(reducer, []);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Гидратация из localStorage после mount
    useEffect(() => {
        dispatch({ type: 'HYDRATE', items: loadFromStorage() });
        setIsHydrated(true);
    }, []);

    // Сохранение в localStorage при изменении корзины (только после гидратации)
    useEffect(() => {
        if (!isHydrated) return;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            // тихо игнорируем квоту/приватный режим
        }
    }, [items, isHydrated]);

    // Блокировка скролла и Escape при открытом drawer
    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            document.removeEventListener('keydown', onKey);
        };
    }, [isOpen]);

    const value = useMemo(() => {
        const detailed = items
            .map((it) => {
                const dish = getDishById(it.id);
                if (!dish) return null;
                return { ...dish, qty: it.qty, lineTotal: dish.price * it.qty };
            })
            .filter(Boolean);

        const totalCount = detailed.reduce((s, it) => s + it.qty, 0);
        const totalPrice = detailed.reduce((s, it) => s + it.lineTotal, 0);

        return {
            items: detailed,
            isHydrated,
            isOpen,
            open: () => setIsOpen(true),
            close: () => setIsOpen(false),
            toggle: () => setIsOpen((v) => !v),
            addItem: (id, qty = 1) => dispatch({ type: 'ADD', id, qty }),
            removeItem: (id) => dispatch({ type: 'REMOVE', id }),
            setQty: (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
            clear: () => dispatch({ type: 'CLEAR' }),
            totalCount,
            totalPrice,
        };
    }, [items, isHydrated, isOpen]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}