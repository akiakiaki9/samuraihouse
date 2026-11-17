
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { site } from '@/config/site';

export default function Footer() {
    const pathname = usePathname();
    const [year, setYear] = useState('');

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            setYear(String(new Date().getFullYear()));
        });
        return () => window.cancelAnimationFrame(frame);
    }, []);

    if (pathname === '/links') return null;

    // Стандартный футер для остальных страниц
    return (
        <footer className="footer">
            <div className="container footer__inner">
                <div className="footer__col footer__col--brand">
                    <Logo size={44} />
                    <p className="footer__tagline">{site.tagline}</p>

                    <a
                        href={site.social.instagram}
                        className="footer__social"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <InstagramIcon />
                        <span>Instagram</span>
                    </a>
                </div>

                <div className="footer__col">
                    <h3 className="footer__heading">Навигация</h3>
                    <ul className="footer__list">
                        <li>
                            <Link href="/" className="footer__link">
                                Главная
                            </Link>
                        </li>
                        <li>
                            <Link href="/menu" className="footer__link">
                                Меню
                            </Link>
                        </li>
                        <li>
                            <Link href="/links" className="footer__link">
                                Все ссылки
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="footer__col">
                    <h3 className="footer__heading">Контакты</h3>
                    <ul className="footer__list">
                        <li>
                            <a href={site.phoneHref} className="footer__link">
                                {site.phone}
                            </a>
                        </li>
                        <li>
                            <a
                                href={site.mapsUrl}
                                className="footer__link"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {site.address.full}
                            </a>
                        </li>
                        <li className="footer__muted">
                            {site.hours.label}
                        </li>
                    </ul>
                </div>
            </div>

            <div className="container footer__bottom">
                <p className="footer__copy">
                    © {year && `${year} `}{site.name}. Все права защищены.
                    <span className="footer__credit">
                        Разработано в{' '}
                        <a href="https://www.akbarsoft.uz/" target="_blank" rel="noopener noreferrer">
                            Akbar Soft
                        </a>{' '}
                        (<a href="https://www.akbarsoft.uz/" target="_blank" rel="noopener noreferrer">www.akbarsoft.uz</a>)
                    </span>
                </p>
            </div>
        </footer>
    );
}

function InstagramIcon() {
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
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}
