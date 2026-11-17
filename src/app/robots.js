import { site } from '@/config/site';

export default function sitemap() {
    // Если домен не задан — sitemap возвращает пустой массив,
    // Next.js не падает, но и файл не имеет смысла. Заполним, когда будет домен.
    if (!site.url) return [];

    const now = new Date();

    return [
        {
            url: `${site.url}/`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${site.url}/menu`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
    ];
}