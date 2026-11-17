import MenuClient from '@/components/MenuClient';

export const metadata = {
    title: 'Меню — SAMURAI HOUSE | Суши, роллы, сеты в Бухаре',
    description:
        'Полное меню ресторана SAMURAI HOUSE в Бухаре: суши, роллы, сеты, вок, супы, пицца, поке, сашими. Заказ доставки и самовывоза.',
    openGraph: {
        title: 'Меню — SAMURAI HOUSE',
        description:
            'Суши, роллы, сеты, вок и блюда от шефа. Доставка по Бухаре и самовывоз.',
        type: 'website',
    },
};

export default function MenuPage() {
    return (
        <>
            <section className="menu-hero">
                <div className="container">
                    <span className="eyebrow">Меню</span>
                    <h1 className="menu-hero__title">Всё меню SAMURAI HOUSE</h1>
                    <p className="menu-hero__lead">
                        Выберите категорию или воспользуйтесь поиском. Добавляйте блюда в
                        корзину и оформляйте заказ — доставка по Бухаре или самовывоз.
                    </p>
                </div>
            </section>

            <MenuClient />
        </>
    );
}