import Image from 'next/image';
import Link from 'next/link';

export default function Logo({ href = '/', size = 40, withText = true }) {
    return (
        <Link href={href} className="logo" aria-label="SAMURAI HOUSE — на главную">
            <span className="logo__mark" style={{ width: size, height: size }}>
                <Image
                    src="/images/logo.png"
                    alt="Логотип SAMURAI HOUSE"
                    fill
                    sizes={`${size}px`}
                    priority
                    style={{ objectFit: 'contain' }}
                />
            </span>
            {withText && (
                <span className="logo__text">
                    <span className="logo__title">SAMURAI</span>
                    <span className="logo__subtitle">HOUSE</span>
                </span>
            )}
        </Link>
    );
}