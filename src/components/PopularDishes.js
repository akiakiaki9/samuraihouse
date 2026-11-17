import Link from 'next/link';
import DishImage from './ui/DishImage';
import { dishes } from '@/data/menu';
import { formatPrice, formatWeight } from '@/lib/format';

const POPULAR_IDS = [
    'philadelphia',
    'california-crab-roll',
    'baked-philadelphia',
    'samurai-set',
    'poke-salmon',
    'chicken-pizza',
];

export default function PopularDishes() {
    const popular = POPULAR_IDS
        .map((id) => dishes.find((d) => d.id === id))
        .filter(Boolean);

    if (!popular.length) return null;

    return (
        <section className="section popular">
            <div className="container">
                <div className="section-head">
                    <div>
                        <span className="eyebrow">Популярное</span>
                        <h2 className="section-title">Гости выбирают</h2>
                    </div>
                    <Link href="/menu" className="section-head__link">
                        Всё меню →
                    </Link>
                </div>

                <div className="popular__grid">
                    {popular.map((dish) => (
                        <article key={dish.id} className="dish-card">
                            <div className="dish-card__media">
                                <DishImage
                                    src={dish.image}
                                    alt={dish.name}
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                            </div>
                            <div className="dish-card__body">
                                <h3 className="dish-card__title">{dish.name}</h3>
                                {dish.description && (
                                    <p className="dish-card__desc">{dish.description}</p>
                                )}
                                <div className="dish-card__meta">
                                    <span className="dish-card__price">
                                        {formatPrice(dish.price)}
                                    </span>
                                    {dish.weight && (
                                        <span className="dish-card__weight">
                                            {formatWeight(dish.weight)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}