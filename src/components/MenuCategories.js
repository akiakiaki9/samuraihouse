import Link from 'next/link';
import { categories } from '@/data/menu';
import { orderMenuCategories } from '@/data/menu-category-order';

export default function MenuCategories() {
    const orderedCategories = orderMenuCategories(categories);

    return (
        <section className="section categories">
            <div className="container">
                <div className="section-head">
                    <div>
                        <span className="eyebrow">Меню</span>
                        <h2 className="section-title">Категории</h2>
                    </div>
                </div>

                <ul className="categories__grid">
                    {orderedCategories.map((cat, i) => (
                        <li key={cat.id}>
                            <Link
                                href={`/menu#${cat.id}`}
                                className="category-card"
                            >
                                <span className="category-card__index">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="category-card__name">{cat.name}</span>
                                <span className="category-card__arrow" aria-hidden="true">→</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}