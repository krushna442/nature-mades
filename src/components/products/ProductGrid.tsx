import { ProductCard } from './ProductCard';
import type { Product } from '../../types';
import { StaggerReveal } from '../motion/ScrollReveal';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <h3 className="font-heading text-2xl text-primary">No products found</h3>
        <p className="mt-2 text-secondary">Try adjusting your filters to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <StaggerReveal className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </StaggerReveal>
  );
}
