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
            <h1 className="font-heading text-4xl font-bold text-primary sm:text-5xl">Shop the Collection</h1>
            <p className="mt-4 text-lg text-secondary">Handcrafted essentials for mindful living</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row md:items-center">
            <div className="flex w-full flex-wrap gap-3 overflow-x-auto pb-2 md:w-auto md:pb-0 hide-scrollbar">
              <button
                onClick={() => setCategory('all')}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  categoryParam === 'all' ? 'bg-accent text-white' : 'text-primary hover:bg-white/10'
                }`}
                style={categoryParam !== 'all' ? {
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                } : {}}
              >
                All
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat.id || cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                    categoryParam === cat.slug ? 'bg-accent text-white' : 'text-primary hover:bg-white/10'
                  }`}
                  style={categoryParam !== cat.slug ? {
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.1)'
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
                className="w-full cursor-pointer appearance-none rounded-lg px-4 py-2 text-sm text-primary outline-none md:w-48 focus:ring-2 focus:ring-accent"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <option value="featured" className="bg-[#1a1a1a] text-white">Featured</option>
                <option value="price-low" className="bg-[#1a1a1a] text-white">Price: Low to High</option>
                <option value="price-high" className="bg-[#1a1a1a] text-white">Price: High to Low</option>
                <option value="top-rated" className="bg-[#1a1a1a] text-white">Top Rated</option>
              </select>
            </div>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="py-20 text-center text-[#A8A29E]">
            <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Loading handcrafted products...</p>
          </div>
        ) : (
          <ProductGrid products={productsList} />
        )}
      </div>
    </div>
  );
}
