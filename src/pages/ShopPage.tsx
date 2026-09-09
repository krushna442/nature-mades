import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '../components/products/ProductGrid';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { fetchProducts, fetchCategories } from '../services/productService';
import type { Product, Category } from '../types';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const sortParam = searchParams.get('sort') || 'featured';

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategoriesList);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts({
      category: categoryParam,
      sortBy: sortParam,
    })
      .then((res) => {
        setProductsList(res.products);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categoryParam, sortParam]);

  const setCategory = (cat: string) => {
    setSearchParams(prev => {
      if (cat === 'all') {
        prev.delete('category');
      } else {
        prev.set('category', cat);
      }
      return prev;
    });
  };

  const setSort = (sort: string) => {
    setSearchParams(prev => {
      prev.set('sort', sort);
      return prev;
    });
  };

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#486838] block mb-2">
              Artisan Pantry & Craft
            </span>
            <h1 className="font-heading text-4xl font-bold text-[#F8F8E8] sm:text-5xl">Shop the Collection</h1>
            <p className="mt-3 text-base text-[#786848]">Handcrafted essentials for mindful, natural living</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row md:items-center">
            <div className="flex w-full flex-wrap gap-3 overflow-x-auto pb-2 md:w-auto md:pb-0 hide-scrollbar">
              <button
                onClick={() => setCategory('all')}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  categoryParam === 'all' ? 'bg-[#486838] text-[#F8F8E8]' : 'text-[#786848] hover:text-[#F8F8E8] hover:bg-white/10'
                }`}
                style={categoryParam !== 'all' ? {
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.08)'
                } : {}}
              >
                All
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat.id || cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                    categoryParam === cat.slug ? 'bg-[#486838] text-[#F8F8E8]' : 'text-[#786848] hover:text-[#F8F8E8] hover:bg-white/10'
                  }`}
                  style={categoryParam !== cat.slug ? {
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  } : {}}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex w-full justify-end md:w-auto">
              <select
                value={sortParam}
                onChange={(e) => setSort(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl px-4 py-2 text-sm text-[#F8F8E8] outline-none md:w-48 focus:ring-1 focus:ring-[#486838]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <option value="featured" className="bg-[#1a1a1a] rounded-lg text-[#F8F8E8]">Featured</option>
                <option value="price-low" className="bg-[#1a1a1a] rounded-lg text-[#F8F8E8]">Price: Low to High</option>
                <option value="price-high" className="bg-[#1a1a1a] rounded-lg text-[#F8F8E8]">Price: High to Low</option>
                <option value="top-rated" className="bg-[#1a1a1a] rounded-lg text-[#F8F8E8]">Top Rated</option>
              </select>
            </div>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="py-20 text-center text-[#786848]">
            <div className="inline-block w-8 h-8 border-2 border-[#486838] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Loading handcrafted products...</p>
          </div>
        ) : (
          <ProductGrid products={productsList} />
        )}
      </div>
    </div>
  );
}
