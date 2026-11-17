'use client';

import { useState } from 'react';
import Image from 'next/image';

const PLACEHOLDER = '/images/placeholder.png';

export default function DishImage({
    src,
    alt,
    sizes = '(max-width: 768px) 100vw, 33vw',
    priority = false,
}) {
    const [errored, setErrored] = useState(false);
    const finalSrc = !src || errored ? PLACEHOLDER : src;

    return (
        <Image
            src={finalSrc}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            onError={() => setErrored(true)}
            style={{ objectFit: 'contain' }}
        />
    );
}