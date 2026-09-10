import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  aspectRatio?: string;
  className?: string;
}

export function ProductImage({ src, alt, aspectRatio = 'aspect-[4/5]', className = '' }: ProductImageProps) {
  const [error, setError] = useState(false);
  const initial = alt ? alt.charAt(0).toUpperCase() : 'N';

  const isPlaceholder = src.includes('placeholder') || src === '' || error;

  return (
    <div className={`relative w-full overflow-hidden rounded-t-xl bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] ${aspectRatio} ${className}`}>
      {isPlaceholder ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-heading text-white opacity-20">{initial}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setError(true)}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      )}
    </div>
  );
}
