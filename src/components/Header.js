
'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import Logo from './Logo';
import { site } from '@/config/site';
import { useCart } from './CartProvider';

const NAV_LINKS = [
    { href: '/', label: 'Главная' },
    { href: '/menu', label: 'Меню' },
    { href: '/#about', label: 'О нас' },
    { href: '/#contacts', label: 'Контакты' },
];

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Header() {
    const pathname = usePathname();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { open: openCart, totalCount, isHydrated } = useCart();
    const isPortalReady = useSyncExternalStore(
        subscribeToClient,
        getClientSnapshot,
        getServerSnapshot
    );

    useEffect(() => {
        if (!isMenuOpen) return;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') setIsMenuOpen(false);
        };

        document.addEventListener('keydown', onKeyDown);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = prev;
        };
    }, [isMenuOpen]);

    const closeMenu = () => setIsMenuOpen(false);

    const handleCartClick = () => {
        setIsMenuOpen(false);
        openCart();
    };

    const showBadge = isHydrated && totalCount > 0;

    // Скрываем Header на странице /links
    if (pathname === '/links') return null;

    return (
        <>
        <header className={`header${pathname === '/menu' ? ' header--menu-page' : ''}${isMenuOpen ? ' is-menu-open' : ''}`}>
            <div className="container header__inner">
                <Logo />

                <nav className="header__nav" aria-label="Основная навигация">
                    <ul className="header__nav-list">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="header__nav-link">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="header__actions">
                    <a
                        href={site.phoneHref}
                        className="header__phone"
                        aria-label={`Позвонить: ${site.phone}`}
                    >
                        {site.phone}
                    </a>

                    <button
                        type="button"
                        className="header__cart"
                        aria-label="Открыть корзину"
                        onClick={handleCartClick}
                    >
                        <CartIcon />
                        {showBadge && (
                            <span className="header__cart-badge">
                                {totalCount > 99 ? '99+' : totalCount}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        className={`header__burger ${isMenuOpen ? 'is-open' : ''}`}
                        aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-menu"
                        onClick={() => setIsMenuOpen((v) => !v)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </div>

        </header>
        {!isMenuOpen && (
            <button
                type="button"
                className="floating-cart"
                aria-label="Быстро открыть корзину"
                onClick={handleCartClick}
            >
                <CartIcon />
                <span>Корзина</span>
                {showBadge && (
                    <span className="floating-cart__badge">
                        {totalCount > 99 ? '99+' : totalCount}
                    </span>
                )}
            </button>
        )}
        {isPortalReady && createPortal(
            <>
                <div
                    id="mobile-menu"
                    className={`mobile-menu ${isMenuOpen ? 'is-open' : ''}`}
                    aria-hidden={!isMenuOpen}
                    inert={!isMenuOpen}
                >
                    <nav aria-label="Мобильная навигация">
                        <ul className="mobile-menu__list">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="mobile-menu__link"
                                        onClick={closeMenu}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="mobile-menu__footer">
                        <a href={site.phoneHref} className="mobile-menu__phone">
                            {site.phone}
                        </a>
                        <p className="mobile-menu__hours">{site.hours.label}</p>
                    </div>
                </div>

                {isMenuOpen && (
                    <button
                        type="button"
                        className="mobile-menu__backdrop"
                        aria-label="Закрыть меню"
                        onClick={closeMenu}
                    />
                )}
            </>,
            document.body
        )}
        </>
    );
}

function CartIcon() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    );
}
