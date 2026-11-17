export const site = {
    name: 'SAMURAI HOUSE',
    tagline: 'Японская и азиатская кухня в Бухаре',
    description:
        'Премиальный ресторан японской и азиатской кухни в Бухаре. Суши, роллы, сеты, вок, супы и блюда от шефа. Доставка и самовывоз.',

    // Публичный URL. Пока пустой — canonical/OG-url не рендерятся.
    // Когда появится домен — впиши в .env.local: NEXT_PUBLIC_SITE_URL=https://samuraihouse.uz
    url: process.env.NEXT_PUBLIC_SITE_URL || '',

    // Дефолтная OG-картинка (положи файл в public/images/og.jpg, 1200×630)
    ogImage: '/images/og.jpg',

    phone: '+998 90 412 32 32',
    phoneHref: 'tel:+998904123232',

    address: {
        country: 'Узбекистан',
        city: 'Бухара',
        street: 'Каюма Муртазаева, 210',
        full: 'Каюма Муртазаева, 210, Бухара, Узбекистан',
    },

    hours: {
        label: 'Ежедневно с 11:00 до 02:00',
        open: '11:00',
        close: '02:00',
    },

    geo: {
        lat: 39.755825,
        lng: 64.408614,
    },

    social: {
        instagram: 'https://www.instagram.com/samurai_house_bukhara/',
    },

    mapsUrl: 'https://maps.app.goo.gl/DTsMwR16fN2DFnGu5',

    wifi: {
        ssid: 'Samurai 5G',
        password: 'Samurai0707',
    },

    cuisine: ['Японская', 'Азиатская', 'Суши'],
    priceRange: '₽₽',
};