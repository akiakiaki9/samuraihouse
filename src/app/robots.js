import { site } from '@/config/site';

export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/'],
        },
        ...(site.url ? { sitemap: `${site.url}/sitemap.xml` } : {}),
    };
}