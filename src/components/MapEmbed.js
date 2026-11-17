import { site } from '@/config/site';

export default function MapEmbed() {
    const { lat, lng } = site.geo;
    const src = `https://www.google.com/maps?q=${lat},${lng}&hl=ru&z=16&output=embed`;

    return (
        <section className="map-embed" aria-label="Карта расположения ресторана">
            <iframe
                src={src}
                title="SAMURAI HOUSE на карте"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
            />
        </section>
    );
}