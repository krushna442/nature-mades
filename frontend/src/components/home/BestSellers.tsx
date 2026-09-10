import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal, StaggerReveal } from '../motion/ScrollReveal';
import type { Product } from '../../types';
import { fetchBestSellerProducts } from '../../services/productService';
import { useCartStore } from '../../store/cartStore';

export const BestSellers: React.FC = () => {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    fetchBestSellerProducts().then((data) => {
      setBestSellers(data.slice(0, 4));
    });
  }, []);

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-12 flex justify-between items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#486838] block mb-2">
                Community Favorites
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-[#F8F8E8]">Best Sellers</h2>
            </div>
            <Link to="/shop" className="text-sm text-[#786848] border-b border-[#786848]/40 hover:text-[#F8F8E8] hover:border-[#F8F8E8] pb-1 transition-colors">
              Shop All
            </Link>
          </div>
        </ScrollReveal>

        <StaggerReveal className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {bestSellers.map((product) => (
            <div key={product.id} className="flex flex-col group">
              <Link to={`/product/${product.slug}`} className="block relative aspect-[4/5] rounded-xl overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1f261c] to-transparent flex items-center justify-center border border-white/5">
                  <span className="text-4xl font-serif text-[#F8F8E8]/40">{product.name.charAt(0)}</span>
                </div>
              </Link>
              <div className="flex-1 flex flex-col">
                <span className="text-xs text-[#486838] uppercase tracking-wider mb-1 font-medium">{product.category}</span>
                <Link to={`/product/${product.slug}`} className="text-[#F8F8E8] font-medium mb-1 hover:text-[#5e844a] transition-colors line-clamp-1">
                  {product.name}
                </Link>
                <div className="flex items-center text-[#786848] text-xs mb-3">
                  <span className="text-[#C4A35A] mr-1">{'★'.repeat(Math.round(product.rating))}</span>
                  <span className="opacity-70">({product.reviewCount})</span>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[#F8F8E8] font-semibold">${product.price.toFixed(2)}</span>
                    {product.compareAtPrice && (
                      <span className="text-[#786848] line-through text-xs">${product.compareAtPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      addItem(product);
                      openCart();
                    }}
                    aria-label={`Add ${product.name} to cart`}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
};
