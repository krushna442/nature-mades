import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { ProductImage } from './ProductImage';
import type { Product } from '../../types';

export type { Product };

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault();
    addItem(product);
    openCart();
  };

  const handleWishlist = (e: MouseEvent) => {
    e.preventDefault();
    // Wishlist logic placeholder
  };

  const mainImage = product.images?.[0] || '';

  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Link to={`/product/${product.slug}`} className="flex h-full flex-col">
        <div className="relative overflow-hidden">
          <ProductImage src={mainImage} alt={product.name} />
          
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
            {product.bestSeller && (
              <span className="rounded-full bg-accent/90 px-2.5 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-md">
                Bestseller
              </span>
            )}
            <span
              className="rounded-full px-2.5 py-1 text-xs font-medium tracking-wide text-white"
              style={{
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {product.category}
            </span>
          </div>

          <button
            onClick={handleWishlist}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
            style={{
              background: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
            aria-label="Add to wishlist"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            <div className="mb-1 flex items-center gap-1 text-sm text-yellow-500">
              <span className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>{i < Math.floor(product.rating) ? '★' : '☆'}</span>
                ))}
              </span>
              <span className="text-xs text-secondary">({product.reviewCount})</span>
            </div>
            
            <h3 className="font-heading text-lg font-medium text-primary line-clamp-1">{product.name}</h3>
            <p className="mt-1 text-sm text-secondary line-clamp-1">{product.shortDescription}</p>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-primary">${product.price.toFixed(2)}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-secondary line-through">${product.compareAtPrice.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <button
          onClick={handleAddToCart}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
