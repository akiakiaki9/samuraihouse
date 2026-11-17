import { site } from '@/config/site';

/**
 * Собирает metadata для страницы.
 * @param {object} opts
 * @param {string} opts.title        — title (без суффикса бренда, добавим сами)
 * @param {string} opts.description
 * @param {string} [opts.path]       — путь от корня: '/', '/menu', '/links'
 * @param {string} [opts.ogImage]    — путь к OG-картинке, по умолчанию site.ogImage
 * @param {boolean} [opts.noindex]   — если true, robots: noindex,nofollow
 */
export function buildMetadata({
    title,
    description,
    path = '/',
    ogImage,
    noindex = false,
} = {}) {
    const fullTitle = title ? `${title} — ${site.name}` : site.name;
    const url = site.url ? `${site.url}${path}` : undefined;
    const image = ogImage || site.ogImage;

    const metadata = {
        title: fullTitle,
        description,
        keywords: [
            'суши Бухара',
            'роллы Бухара',
            'японская кухня Бухара',
            'доставка суши Бухара',
            'SAMURAI HOUSE',
            'азиатская кухня Бухара',
            'пицца Бухара',
            'вок Бухара',
        ],
        authors: [{ name: site.name }],
        openGraph: {
            title: fullTitle,
            description,
            type: 'website',
            locale: 'ru_RU',
            siteName: site.name,
            ...(url ? { url } : {}),
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: site.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [image],
        },
        robots: noindex
            ? { index: false, follow: false }
            : { index: true, follow: true },
    };

    if (url) metadata.alternates = { canonical: url };

    return metadata;
}