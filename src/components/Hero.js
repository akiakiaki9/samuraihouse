import Link from 'next/link';
import Image from 'next/image';
import { site } from '@/config/site';

export default function Hero() {
    return (
        <section className="hero">
            <div className="hero__bg" aria-hidden="true">
                <Image
                    src="/images/hero/hero.png"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    style={{ objectFit: 'cover' }}
                />
                <div className="hero__overlay" />
            </div>

            <div className="container hero__inner">
                <div className="hero__content">
                    <span className="eyebrow">Японская кухня · Бухара</span>

                    <h1 className="hero__title">
                        Вкус Японии <br />
                        <span className="hero__title-accent">в сердце Бухары</span>
                    </h1>

                    <p className="hero__lead">
                        Премиальные суши, роллы и блюда азиатской кухни. Свежие ингредиенты,
                        авторские рецепты и атмосфера, в которую хочется возвращаться.
                    </p>

                    <div className="hero__actions">
                        <Link href="/menu" className="btn btn--primary">
                            Смотреть меню
                        </Link>
                        <a href={site.phoneHref} className="btn btn--ghost">
                            Позвонить
                        </a>
                    </div>

                    <dl className="hero__meta">
                        <div className="hero__meta-item">
                            <dt>График</dt>
                            <dd>{site.hours.label}</dd>
                        </div>
                        <div className="hero__meta-item">
                            <dt>Адрес</dt>
                            <dd>{site.address.street}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="hero__scroll" aria-hidden="true">
                <span />
            </div>
        </section>
    );
}