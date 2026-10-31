import Image from 'next/image';

import { productImageSrc } from '../lib/product-image';

type ProductImageProps = {
  category: string;
  imageUrl?: string | null;
  alt: string;
  className?: string;
};

export function ProductImage({ category, imageUrl, alt, className }: ProductImageProps) {
  return (
    <span className={`relative block overflow-hidden bg-slate-100 ${className ?? ''}`}>
      <Image
        src={productImageSrc(category, imageUrl)}
        alt={alt}
        fill
        unoptimized
        sizes="540px"
        className="object-contain"
      />
    </span>
  );
}
