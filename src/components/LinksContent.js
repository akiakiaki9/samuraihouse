"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

function Icon({ name }) {
  const common = {
    width: 22, height: 22, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round",
    strokeLinejoin: "round", "aria-hidden": true,
  };
  const paths = {
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1Z" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    wifi: <><path d="M5 9a11 11 0 0 1 14 0M8 12a6.5 6.5 0 0 1 8 0M11 15a2 2 0 0 1 2 0M12 19h.01" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    external: <><path d="M14 3h7v7M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
  };
  return <svg {...common}>{paths[name] || paths.arrow}</svg>;
}

function ActionLink({ href, icon, children, primary = false, external = false }) {
  const className = `sh-links-action${primary ? " sh-links-action--primary" : ""}`;
  const content = <>
    <span className="sh-links-action__icon"><Icon name={icon} /></span>
    <span className="sh-links-action__text">{children}</span>
    <span className="sh-links-action__arrow"><Icon name={external ? "external" : "arrow"} /></span>
  </>;
  return external
    ? <a className={className} href={href} target="_blank" rel="noopener noreferrer">{content}</a>
    : <Link className={className} href={href}>{content}</Link>;
}

export default function LinksContent({ site }) {
  const [copied, setCopied] = useState(false);
  const [year, setYear] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setYear(String(new Date().getFullYear()));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function copyWifiPassword() {
    try {
      await navigator.clipboard.writeText(site.wifi.password);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="sh-links">
      <div className="sh-links__glow sh-links__glow--one" aria-hidden="true" />
      <div className="sh-links__glow sh-links__glow--two" aria-hidden="true" />
      <div className="sh-links__grain" aria-hidden="true" />

      <div className="sh-links__wrap">
        <header className="sh-links-brand">
          <div className="sh-links-brand__logo"><Logo size={88} withText={false} /></div>
          <span className="sh-links-brand__eyebrow">JAPANESE • ASIAN CUISINE • BUKHARA</span>
          <h1>SAMURAI <span>HOUSE</span></h1>
          <p>{site.tagline}</p>
          <div className="sh-links-brand__status"><i /> Ежедневно · 11:00–02:00</div>
        </header>

        <section className="sh-links-feature">
          <div className="sh-links-feature__copy">
            <span className="sh-links-kicker">TASTE THE EAST</span>
            <h2>ТВОЙ ВЕЧЕР.<br /><em>ТВОЙ SAMURAI.</em></h2>
            <p>Роллы, суши и блюда азиатской кухни — выбирайте любимое и наслаждайтесь вкусом.</p>
            <Link href="/menu" className="sh-links-feature__button">Смотреть меню <Icon name="arrow" /></Link>
          </div>
          <div className="sh-links-feature__art" aria-hidden="true">
            <span className="sh-links-feature__kanji">侍</span>
            <span className="sh-links-feature__seal">SAMURAI<br />HOUSE</span>
            <span className="sh-links-feature__ring" />
          </div>
        </section>

        <section className="sh-links-section">
          <div className="sh-links-section__heading">
            <span className="sh-links-kicker">QUICK ACCESS</span>
            <h2>МЫ НА СВЯЗИ</h2>
          </div>
          <article className="sh-links-detail sh-links-detail--wifi sh-links-wifi--quick">
            <div className="sh-links-wifi__heading">
              <span className="sh-links-detail__icon"><Icon name="wifi" /></span>
              <span className="sh-links-detail__label">WI-FI ДЛЯ ГОСТЕЙ</span>
            </div>
            <div className="sh-links-wifi__credentials">
              <div className="sh-links-wifi__row"><span>Сеть</span><strong>{site.wifi.ssid}</strong></div>
              <div className="sh-links-wifi__row"><span>Пароль</span><strong>{site.wifi.password}</strong></div>
            </div>
            <button type="button" onClick={copyWifiPassword} className="sh-links-copy">
              <Icon name={copied ? "check" : "copy"} />
              {copied ? "Скопировано" : "Скопировать пароль"}
            </button>
          </article>
          <nav className="sh-links-actions" aria-label="Ссылки ресторана">
            <ActionLink href="/menu" icon="menu" primary>Открыть меню</ActionLink>
            <ActionLink href={site.social.instagram} icon="instagram" external>Instagram</ActionLink>
            <ActionLink href={site.mapsUrl} icon="pin" external>Построить маршрут</ActionLink>
            <ActionLink href={site.phoneHref} icon="phone">Позвонить: {site.phone}</ActionLink>
          </nav>
        </section>

        <section className="sh-links-details">
          <div className="sh-links-section__heading">
            <span className="sh-links-kicker">GOOD TO KNOW</span>
            <h2>ИНФОРМАЦИЯ</h2>
          </div>
          <div className="sh-links-detail-grid">
            <article className="sh-links-detail">
              <span className="sh-links-detail__icon"><Icon name="clock" /></span>
              <span className="sh-links-detail__label">ГРАФИК РАБОТЫ</span>
              <strong>{site.hours.label}</strong>
              <small>Работаем для вас каждый день</small>
            </article>
            <article className="sh-links-detail">
              <span className="sh-links-detail__icon"><Icon name="pin" /></span>
              <span className="sh-links-detail__label">НАШ АДРЕС</span>
              <strong>{site.address.full}</strong>
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer">Открыть на карте <Icon name="arrow" /></a>
            </article>
          </div>
        </section>

        <footer className="sh-links-footer">
          <div className="sh-links-footer__mark">侍</div>
          <strong>SAMURAI HOUSE</strong>
          <span>ЯПОНСКАЯ И АЗИАТСКАЯ КУХНЯ · БУХАРА</span>
          <span className="sh-links-footer__credit">Разработано в <a href="https://www.akbarsoft.uz/" target="_blank" rel="noopener noreferrer">Akbar Soft</a></span>
          <Link href="/">← Вернуться на главный сайт</Link>
          <small>© {year && `${year} `}SAMURAI HOUSE. ALL RIGHTS RESERVED.</small>
        </footer>
      </div>
    </div>
  );
}
