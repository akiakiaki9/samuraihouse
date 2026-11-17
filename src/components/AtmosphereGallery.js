import Image from 'next/image';

const PHOTOS = [
    { src: '/images/gallery/1.png', alt: 'Детали интерьера SAMURAI HOUSE' },
    { src: '/images/gallery/2.png', alt: 'Вход в SAMURAI HOUSE' },
];

export default function AtmosphereGallery() {
    return (
        <section className="section atmosphere atmosphere--compact">
            <div className="container">
                <div className="section-head">
                    <div>
                        <span className="eyebrow">Атмосфера</span>
                        <h2 className="section-title">Немного атмосферы</h2>
                    </div>
                </div>

                <div className="atmosphere__grid">
                    {PHOTOS.map((photo, i) => (
                        <figure key={i} className={`atmosphere__item atmosphere__item--${i + 1}`}>
                            <Image
                                src={photo.src}
                                alt={photo.alt}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{ objectFit: 'cover' }}
                            />
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}