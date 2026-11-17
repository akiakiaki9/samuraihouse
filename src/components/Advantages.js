const ITEMS = [
    {
        title: 'Свежие ингредиенты',
        text: 'Ежедневные поставки рыбы и морепродуктов. Готовим только из свежего.',
    },
    {
        title: 'Авторские рецепты',
        text: 'Классика японской кухни в прочтении нашего шефа.',
    },
    {
        title: 'Быстрая доставка',
        text: 'Аккуратно упаковываем и доставляем по Бухаре.',
    },
    {
        title: 'Работаем до 02:00',
        text: 'Поздние ужины — это к нам. Каждый день.',
    },
];

export default function Advantages() {
    return (
        <section className="section advantages">
            <div className="container">
                <div className="section-head">
                    <div>
                        <span className="eyebrow">Почему мы</span>
                        <h2 className="section-title">Наши преимущества</h2>
                    </div>
                </div>

                <ul className="advantages__grid">
                    {ITEMS.map((item, i) => (
                        <li key={item.title} className="advantage-card">
                            <span className="advantage-card__num">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <h3 className="advantage-card__title">{item.title}</h3>
                            <p className="advantage-card__text">{item.text}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}