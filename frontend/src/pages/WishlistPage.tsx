import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { ScrollReveal, StaggerReveal } from '../components/motion/ScrollReveal';
import type { Product } from '../types';

export function WishlistPage() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { wishlist, isLoading, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, isInitialized, fetchWishlist]);

  const handleAddToCart = (product: Product) => {
    addItem(product);
    openCart();
  };

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-[#786848]" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link to="/" className="hover:text-[#F8F8E8] transition-colors">Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link to="/shop" className="hover:text-[#F8F8E8] transition-colors">Shop</Link>
          </li>
          <li>/</li>
          <li className="text-[#F8F8E8]">Wishlist</li>
        </ol>
      </nav>

      {/* Header Banner */}
      <ScrollReveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-white/[0.08] gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#486838]">
              Saved Treasures
            </span>
            <h1
              className="text-3xl sm:text-4xl font-bold text-[#F8F8E8] mt-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Your Wishlist
            </h1>
            <p className="text-sm text-[#786848] mt-1">
              Curate your favorite botanical candles, nourishing oils, and artisan crafts.
            </p>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-3 bg-white/[0.03] px-5 py-3 rounded-2xl border border-white/[0.08]">
              <span className="text-2xl">🌿</span>
              <div>
                <span className="text-[11px] text-[#786848] block uppercase tracking-wider">Saved Items</span>
                <span className="text-lg font-bold text-[#F8F8E8] font-mono">{wishlist.length}</span>
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* State 1: Auth Loading */}
      {!isInitialized ? (
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#486838] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-[#786848]">Loading your saved creations...</p>
        </div>
      ) : !isAuthenticated ? (
        /* State 2: Unauthenticated */
        <ScrollReveal>
          <div
            className="rounded-3xl p-10 text-center max-w-lg mx-auto"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="w-16 h-16 rounded-full bg-[#486838]/20 flex items-center justify-center mx-auto mb-4 border border-[#486838]/40">
              <span className="text-2xl text-[#F8F8E8]">🤍</span>
            </div>
            <h2
              className="text-2xl font-bold text-[#F8F8E8] mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Sign in to save your favorites
            </h2>
            <p className="text-sm text-[#786848] mb-6">
              Create a patron account or log in to keep track of the artisan creations you love most.
            </p>
            <button
              onClick={() => navigate('/account')}
              className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold text-[#0A0A0A] bg-[#F8F8E8] hover:bg-white transition-all duration-200"
            >
              Sign In to Your Account
            </button>
          </div>
        </ScrollReveal>
      ) : isLoading ? (
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#486838] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-[#786848]">Loading your saved creations...</p>
        </div>
      ) : wishlist.length === 0 ? (
        /* State 2: Empty Wishlist */
        <ScrollReveal>
          <div
            className="rounded-3xl p-12 text-center max-w-xl mx-auto"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <span className="text-4xl mb-4 block opacity-60">✨</span>
            <h2
              className="text-2xl font-bold text-[#F8F8E8] mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Your wishlist is empty
            </h2>
            <p className="text-sm text-[#786848] mb-6 max-w-md mx-auto">
              Explore our collection of hand-poured candles, botanical soaps, pure oils, and artisan woodwork, then click the heart icon to save your favorites.
            </p>
            <Link
              to="/shop"
              className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold text-[#0A0A0A] bg-[#F8F8E8] hover:bg-white transition-all duration-200"
            >
              Discover Handcrafted Collection
            </Link>
          </div>
        </ScrollReveal>
      ) : (
        /* State 3: Wishlist Products Grid */
        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id || product.slug}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                {/* Product Image & Remove Button */}
                <div className="relative aspect-square overflow-hidden bg-black/40 flex items-center justify-center">
                  <Link to={`/product/${product.slug}`} className="w-full h-full block">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                  </Link>
                  <span className="absolute inset-0 flex items-center justify-center -z-10 text-4xl font-heading text-white/20 select-none">
                    {product.name?.charAt(0) || '🌿'}
                  </span>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-red-400 hover:text-red-300 hover:scale-110 transition-all border border-white/10"
                    aria-label="Remove from wishlist"
                    title="Remove from wishlist"
                  >
                    <span className="text-sm">✕</span>
                  </button>

                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/60 text-[#F8F8E8] backdrop-blur-md border border-white/10 capitalize">
                    {product.category}
                  </span>
                </div>

                {/* Info */}
                <div className="p-5">
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="font-heading text-lg font-medium text-[#F8F8E8] hover:text-[#486838] transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="mt-1 text-xs text-[#786848] line-clamp-2 leading-relaxed">
                    {product.shortDescription || product.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-semibold text-[#F8F8E8] font-mono">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        product.stock > 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {product.stock > 0 ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex items-center gap-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  className="flex-1 py-2.5 rounded-xl bg-[#486838] text-xs font-semibold text-[#F8F8E8] hover:bg-[#5a8247] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Move to Cart
                </button>
              </div>
            </div>
          ))}
        </StaggerReveal>
      )}
    </div>
  );
}
