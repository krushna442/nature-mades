import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { ProductGrid } from '../components/products/ProductGrid';
import { ScrollReveal } from '../components/motion/ScrollReveal';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const sortParam = searchParams.get('sort') || 'featured';

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

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (categoryParam !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === categoryParam.toLowerCase());
    }

    switch (sortParam) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'top-rated':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1));
        break;
    }

    return result;
  }, [categoryParam, sortParam]);

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
              {categories.map((cat) => (
                <button
                  key={cat.id}
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

        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  );
}
