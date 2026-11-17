import { site } from '@/config/site';

export default function ContactBlock() {
    return (
        <section className="section contacts" id="contacts">
            <div className="container contacts__inner">
                <div>
                    <span className="eyebrow">Контакты</span>
                    <h2 className="section-title">Ждём вас в гости</h2>
                    <p className="section-lead">
                        Забронируйте столик по телефону или закажите доставку. Мы на связи
                        каждый день с 11:00 до 02:00.
                    </p>
                </div>

                <div className="contacts__cards">
                    <a href={site.phoneHref} className="contact-card">
                        <span className="contact-card__label">Телефон</span>
                        <span className="contact-card__value">{site.phone}</span>
                    </a>

                    <a
                        href={site.mapsUrl}
                        className="contact-card"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className="contact-card__label">Адрес</span>
                        <span className="contact-card__value">{site.address.full}</span>
                    </a>

                    <div className="contact-card">
                        <span className="contact-card__label">Часы работы</span>
                        <span className="contact-card__value">{site.hours.label}</span>
                    </div>

                    <a
                        href={site.social.instagram}
                        className="contact-card"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className="contact-card__label">Instagram</span>
                        <span className="contact-card__value">@samurai_house_bukhara</span>
                    </a>
                </div>
            </div>
        </section>
    );
}