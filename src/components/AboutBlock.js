import Link from 'next/link';

export default function AboutBlock() {
    return (
        <section className="section about" id="about">
            <div className="container about__inner">
                <div className="about__text">
                    <span className="eyebrow">О ресторане</span>
                    <h2 className="section-title">
                        Место, где встречаются <br />
                        традиции и современность
                    </h2>
                    <p className="section-lead">
                        SAMURAI HOUSE — это пространство японской и азиатской кухни в Бухаре,
                        где каждая деталь продумана: от свежести рыбы до подачи блюда.
                        Мы соединяем классические рецепты с авторским подходом шефа.
                    </p>
                    <p className="about__paragraph">
                        Уютный зал, внимательный сервис и блюда, которые хочется
                        фотографировать. Приходите на ужин, заказывайте доставку или
                        забирайте с собой — мы работаем каждый день до двух часов ночи.
                    </p>
                    <Link href="/menu" className="btn btn--ghost about__cta">
                        Открыть меню
                    </Link>
                </div>

                <div className="about__stats">
                    <div className="about__stat">
                        <span className="about__stat-value">147</span>
                        <span className="about__stat-label">позиций в меню</span>
                    </div>
                    <div className="about__stat">
                        <span className="about__stat-value">17</span>
                        <span className="about__stat-label">категорий блюд</span>
                    </div>
                    <div className="about__stat">
                        <span className="about__stat-value">11–02</span>
                        <span className="about__stat-label">работаем ежедневно</span>
                    </div>
                </div>
            </div>
        </section>
    );
}