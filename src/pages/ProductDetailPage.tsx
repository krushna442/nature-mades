import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Product } from '../types';
import { fetchProductBySlug } from '../services/productService';
import { useCartStore } from '../store/cartStore';
import { ScrollReveal } from '../components/motion/ScrollReveal';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) return;
    setIsLoading(true);
    fetchProductBySlug(slug)
      .then((data) => {
        setProduct(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#4A7C59] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-[#A8A29E]">Loading handcrafted details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#F5F0EB] mb-2">Product not found</h1>
          <p className="text-[#A8A29E] mb-6">The product you're looking for doesn't exist.</p>
          <Link
            to="/shop"
            className="inline-flex px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: '#F5F0EB', color: '#0A0A0A' }}
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
    openCart();
  };

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(product.rating) ? '★' : '☆');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const detailSections = [
    { key: 'description', label: 'Description', content: product.description },
    ...(product.ingredients?.length ? [{ key: 'ingredients', label: 'Ingredients', content: product.ingredients.join(', ') }] : []),
    ...(product.materials?.length ? [{ key: 'materials', label: 'Materials', content: product.materials.join(', ') }] : []),
    { key: 'shipping', label: 'Shipping & Returns', content: 'Free shipping on orders over $50. Standard delivery takes 5-7 business days. Returns accepted within 30 days of purchase.' },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-[#78716C]" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 flex-wrap">
            <li><Link to="/" className="hover:text-[#A8A29E] transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link to="/shop" className="hover:text-[#A8A29E] transition-colors">Shop</Link></li>
            <li>/</li>
            <li className="text-[#A8A29E]">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left — Image Gallery */}
          <ScrollReveal>
            <div>
              {/* Main Image */}
              <div
                className="aspect-[4/5] rounded-2xl overflow-hidden mb-4 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 50%, #1a1a1a 100%)' }}
              >
                <span className="text-6xl font-bold text-white/[0.08]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {product.name[0]}
                </span>
              </div>
              {/* Thumbnails */}
              <div className="flex gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-1 aspect-square rounded-xl overflow-hidden flex items-center justify-center transition-all duration-200 ${
                      activeImage === i ? 'ring-2 ring-[#4A7C59] ring-offset-2 ring-offset-[#0A0A0A]' : 'opacity-50 hover:opacity-75'
                    }`}
                    style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #222 100%)' }}
                    aria-label={`View image ${i + 1}`}
                  >
                    <span className="text-sm text-white/[0.15] font-medium">{i + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Right — Product Info */}
          <ScrollReveal delay={0.15}>
            <div
              className="rounded-2xl p-6 lg:p-8 h-fit lg:sticky lg:top-28"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {/* Category */}
              <span className="text-xs font-medium text-[#4A7C59] uppercase tracking-wider">
                {product.category}
              </span>

              {/* Name */}
              <h1
                className="text-2xl sm:text-3xl font-bold text-[#F5F0EB] mt-2 mb-3"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#C4A35A] text-sm tracking-wider">{stars.join('')}</span>
                <span className="text-xs text-[#78716C]">({product.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl font-bold text-[#F5F0EB]">${product.price.toFixed(2)}</span>
                {product.compareAtPrice && (
                  <span className="text-lg text-[#78716C] line-through">${product.compareAtPrice.toFixed(2)}</span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-[#A8A29E] leading-relaxed mb-6">{product.shortDescription}</p>

              <div className="h-px bg-white/[0.06] mb-6" />

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-5">
                <span className="text-sm text-[#A8A29E]">Quantity</span>
                <div className="flex items-center gap-0 border border-white/[0.1] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-[#A8A29E] hover:text-white hover:bg-white/[0.04] disabled:opacity-30 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-sm text-[#F5F0EB] border-x border-white/[0.1]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 flex items-center justify-center text-[#A8A29E] hover:text-white hover:bg-white/[0.04] disabled:opacity-30 transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-[#78716C]">{product.stock} in stock</span>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:translate-y-[-1px] mb-3"
                style={{ background: '#F5F0EB', color: '#0A0A0A' }}
              >
                Add to Cart — ${(product.price * quantity).toFixed(2)}
              </button>

              {/* Buy Now */}
              <Link
                to="/checkout"
                onClick={() => { for (let i = 0; i < quantity; i++) addItem(product); }}
                className="flex items-center justify-center w-full py-3.5 rounded-xl text-sm font-medium text-[#F5F0EB] border border-white/[0.12] hover:bg-white/[0.04] transition-all duration-200 hover:translate-y-[-1px]"
              >
                Buy Now
              </Link>

              <div className="h-px bg-white/[0.06] my-6" />

              {/* Expandable Sections */}
              {detailSections.map((section) => (
                <div key={section.key} className="border-b border-white/[0.06] last:border-b-0">
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="flex items-center justify-between w-full py-4 text-sm font-medium text-[#F5F0EB] hover:text-white transition-colors"
                    aria-expanded={expandedSection === section.key}
                  >
                    {section.label}
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`transition-transform duration-200 ${expandedSection === section.key ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {expandedSection === section.key && (
                    <p className="pb-4 text-sm text-[#A8A29E] leading-relaxed">{section.content}</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
