'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DishImage from './ui/DishImage';
import { dishes, categories } from '@/data/menu';
import { formatPrice, formatWeight } from '@/lib/format';
import { useCart } from './CartProvider';

export default function MenuClient() {
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedDish, setSelectedDish] = useState(null);
    const [isModalClosing, setIsModalClosing] = useState(false);
    const resultsRef = useRef(null);
    const previousCategory = useRef('all');
    const modalCloseTimer = useRef(null);
    const { items, addItem, setQty } = useCart();

    const closeDishModal = useCallback(() => {
        window.clearTimeout(modalCloseTimer.current);
        setIsModalClosing(true);
        modalCloseTimer.current = window.setTimeout(() => {
            setSelectedDish(null);
            setIsModalClosing(false);
            modalCloseTimer.current = null;
        }, 220);
    }, []);

    // Карта id -> qty из корзины, для быстрого доступа в карточке
    const qtyMap = useMemo(() => {
        const map = new Map();
        items.forEach((it) => map.set(it.id, it.qty));
        return map;
    }, [items]);

    // Якоря: при открытии /menu#cold-rolls — активируем эту категорию
    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            const hash = window.location.hash.replace('#', '');
            if (categories.some((category) => category.id === hash)) {
                setActiveCategory(hash);
            }
        });
        return () => window.cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        if (previousCategory.current === activeCategory) return;

        previousCategory.current = activeCategory;
        const frame = window.requestAnimationFrame(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return () => window.cancelAnimationFrame(frame);
    }, [activeCategory]);

    useEffect(() => {
        if (!selectedDish) return;

        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') closeDishModal();
        };

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [selectedDish, closeDishModal]);

    useEffect(() => () => window.clearTimeout(modalCloseTimer.current), []);

    const normalizedQuery = query.trim().toLowerCase();

    const filtered = useMemo(() => {
        return dishes.filter((dish) => {
            const matchesCategory =
                activeCategory === 'all' || dish.categoryId === activeCategory;
            if (!matchesCategory) return false;

            if (!normalizedQuery) return true;

            const haystack = `${dish.name} ${dish.description || ''}`.toLowerCase();
            return haystack.includes(normalizedQuery);
        });
    }, [activeCategory, normalizedQuery]);

    const handleCategoryClick = (id) => {
        setActiveCategory(id);
        if (typeof window !== 'undefined') {
            const newHash = id === 'all' ? '' : `#${id}`;
            window.history.replaceState(null, '', `/menu${newHash}`);
        }
    };

    return (
        <>
        <section className="section menu-section">
            <div className="container">
                {/* Панель управления */}
                <div className="menu-controls">
                    <label className="menu-search">
                        <SearchIcon />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Поиск по названию блюда"
                            aria-label="Поиск по меню"
                        />
                        {query && (
                            <button
                                type="button"
                                className="menu-search__clear"
                                aria-label="Очистить поиск"
                                onClick={() => setQuery('')}
                            >
                                ×
                            </button>
                        )}
                    </label>
                </div>

                {/* Категории */}
                <div className="menu-cats" role="tablist" aria-label="Категории меню">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeCategory === 'all'}
                        className={`menu-cat ${activeCategory === 'all' ? 'is-active' : ''}`}
                        onClick={() => handleCategoryClick('all')}
                    >
                        Всё меню
                    </button>
                    {categories.map((cat) => {
                        const count = dishes.filter((d) => d.categoryId === cat.id).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                role="tab"
                                aria-selected={activeCategory === cat.id}
                                className={`menu-cat ${activeCategory === cat.id ? 'is-active' : ''
                                    }`}
                                onClick={() => handleCategoryClick(cat.id)}
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                </div>

                {/* Результат */}
                <div className="menu-result-meta">
                    <span>
                        {filtered.length}{' '}
                        {filtered.length === 1
                            ? 'блюдо'
                            : filtered.length > 1 && filtered.length < 5
                                ? 'блюда'
                                : 'блюд'}
                    </span>
                    {activeCategory !== 'all' && (
                        <button
                            type="button"
                            className="menu-result-meta__reset"
                            onClick={() => handleCategoryClick('all')}
                        >
                            Сбросить фильтр
                        </button>
                    )}
                </div>

                {filtered.length === 0 ? (
                    <div ref={resultsRef} className="menu-empty">
                        <p className="menu-empty__title">Ничего не найдено</p>
                        <p className="menu-empty__text">
                            Попробуйте изменить запрос или выбрать другую категорию.
                        </p>
                        <button
                            type="button"
                            className="btn btn--ghost"
                            onClick={() => {
                                setQuery('');
                                handleCategoryClick('all');
                            }}
                        >
                            Сбросить всё
                        </button>
                    </div>
                ) : (
                    <div ref={resultsRef} className="menu-grid">
                        {filtered.map((dish) => (
                            <article key={dish.id} className="menu-card">
                                <button
                                    type="button"
                                    className="menu-card__details"
                                    aria-label={`Подробнее о блюде: ${dish.name}`}
                                    onClick={() => {
                                        window.clearTimeout(modalCloseTimer.current);
                                        setIsModalClosing(false);
                                        setSelectedDish(dish);
                                    }}
                                >
                                    <div className="menu-card__media">
                                        <DishImage
                                            src={dish.image}
                                            alt={dish.name}
                                            sizes="(max-width: 640px) 50vw, 25vw"
                                        />
                                    </div>
                                    <div className="menu-card__body">
                                        <h3 className="menu-card__title">{dish.name}</h3>
                                        {dish.description && (
                                            <p className="menu-card__desc">{dish.description}</p>
                                        )}
                                        <div className="menu-card__meta">
                                            <span className="menu-card__price">
                                                {formatPrice(dish.price) || 'Цена уточняется'}
                                            </span>
                                            {dish.weight && (
                                                <span className="menu-card__weight">
                                                    {formatWeight(dish.weight)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                                <div className="menu-card__actions">
                                    <DishActions
                                        dish={dish}
                                        qty={qtyMap.get(dish.id) || 0}
                                        onAdd={() => addItem(dish.id, 1)}
                                        onInc={() => setQty(dish.id, (qtyMap.get(dish.id) || 0) + 1)}
                                        onDec={() => setQty(dish.id, (qtyMap.get(dish.id) || 0) - 1)}
                                    />
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
        {selectedDish && (
            <div className={`menu-dish-modal${isModalClosing ? ' is-closing' : ''}`}>
                <button
                    type="button"
                    className="menu-dish-modal__backdrop"
                    aria-label="Закрыть описание блюда"
                    onClick={closeDishModal}
                />
                <section
                    className="menu-dish-modal__panel"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="menu-dish-modal-title"
                >
                    <button
                        type="button"
                        className="menu-dish-modal__close"
                        aria-label="Закрыть"
                        onClick={closeDishModal}
                    >
                        ×
                    </button>
                    <div className="menu-dish-modal__media">
                        <DishImage
                            src={selectedDish.image}
                            alt={selectedDish.name}
                            sizes="(max-width: 680px) 90vw, 40vw"
                            priority
                        />
                    </div>
                    <div className="menu-dish-modal__body">
                        <span className="eyebrow">
                            {categories.find((category) => category.id === selectedDish.categoryId)?.name}
                        </span>
                        <h2 id="menu-dish-modal-title">{selectedDish.name}</h2>
                        {selectedDish.description && <p>{selectedDish.description}</p>}
                        <div className="menu-dish-modal__meta">
                            <strong>
                                {formatPrice(selectedDish.price) || 'Цена уточняется'}
                            </strong>
                            {selectedDish.weight && <span>{formatWeight(selectedDish.weight)}</span>}
                        </div>
                        <DishActions
                            dish={selectedDish}
                            qty={qtyMap.get(selectedDish.id) || 0}
                            onAdd={() => addItem(selectedDish.id, 1)}
                            onInc={() => setQty(selectedDish.id, (qtyMap.get(selectedDish.id) || 0) + 1)}
                            onDec={() => setQty(selectedDish.id, (qtyMap.get(selectedDish.id) || 0) - 1)}
                        />
                    </div>
                </section>
            </div>
        )}
        </>
    );
}

function DishActions({ dish, qty, onAdd, onInc, onDec }) {
    if (!Number.isFinite(dish.price) || dish.price <= 0) {
        return (
            <button type="button" className="menu-card__add" disabled>
                Цена уточняется
            </button>
        );
    }

    if (qty === 0) {
        return (
            <button type="button" className="menu-card__add" onClick={onAdd}>
                В корзину
            </button>
        );
    }
    return (
        <div className="menu-card__qty">
            <button type="button" aria-label="Уменьшить" onClick={onDec}>
                −
            </button>
            <span>{qty}</span>
            <button type="button" aria-label="Увеличить" onClick={onInc}>
                +
            </button>
        </div>
    );
}

function SearchIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </svg>
    );
}