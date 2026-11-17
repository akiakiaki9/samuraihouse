import { site } from '@/config/site';

export function restaurantJsonLd() {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: site.name,
        description: site.description,
        telephone: site.phone,
        servesCuisine: site.cuisine,
        priceRange: site.priceRange,
        address: {
            '@type': 'PostalAddress',
            streetAddress: site.address.street,
            addressLocality: site.address.city,
            addressCountry: 'UZ',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: site.geo.lat,
            longitude: site.geo.lng,
        },
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                ],
                opens: '11:00',
                closes: '02:00',
            },
        ],
        sameAs: [site.social.instagram],
    };

    if (site.url) {
        data.url = site.url;
        data.image = `${site.url}${site.ogImage}`;
    }

    return data;
}