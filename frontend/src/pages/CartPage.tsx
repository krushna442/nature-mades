import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { ScrollReveal } from '../components/motion/ScrollReveal';

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h1
            className="text-3xl font-bold text-[#F8F8E8] mb-10"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Your Cart
          </h1>
        </ScrollReveal>

        {items.length === 0 ? (
          <ScrollReveal>
            <div className="text-center py-20">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(120, 104, 72, 0.4)" strokeWidth="1" className="mx-auto mb-4">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="text-[#786848] mb-6">Your cart is empty</p>
              <Link
                to="/shop"
                className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 shadow-lg shadow-[#486838]/20"
                style={{ background: '#486838', color: '#F8F8E8' }}
              >
                Browse Products
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <ScrollReveal key={item.product.id}>
                  <div
                    className="flex gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(120, 104, 72, 0.15)',
                    }}
                  >
                    {/* Image */}
                    <div
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl shrink-0 flex items-center justify-center border border-[#786848]/20"
                      style={{ background: 'linear-gradient(135deg, #12150f, #1e2417)' }}
                    >
                      <span className="text-2xl font-bold text-[#F8F8E8]/15">{item.product.name[0]}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="text-base font-medium text-[#F8F8E8] hover:text-[#486838] transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-[#786848] mt-0.5">{item.product.category}</p>
                      <p className="text-base font-semibold text-[#F8F8E8] mt-2">${item.product.price.toFixed(2)}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-0 border border-[#786848]/30 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-xs text-[#786848] hover:text-[#F8F8E8] hover:bg-[#486838]/10 disabled:opacity-30 transition-colors"
                            aria-label="Decrease"
                          >−</button>
                          <span className="w-10 h-8 flex items-center justify-center text-sm text-[#F8F8E8] border-x border-[#786848]/30">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-8 h-8 flex items-center justify-center text-xs text-[#786848] hover:text-[#F8F8E8] hover:bg-[#486838]/10 disabled:opacity-30 transition-colors"
                            aria-label="Increase"
                          >+</button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-xs text-[#786848] hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}

              <button
                onClick={clearCart}
                className="text-xs text-[#786848] hover:text-red-400 transition-colors mt-2"
              >
                Clear Cart
              </button>
            </div>

            {/* Summary */}
            <ScrollReveal delay={0.1}>
              <div
                className="rounded-2xl p-6 h-fit lg:sticky lg:top-28"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(120, 104, 72, 0.2)',
                }}
              >
                <h2 className="text-lg font-semibold text-[#F8F8E8] mb-5">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#786848]">Subtotal</span>
                    <span className="text-[#F8F8E8] font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#786848]">Shipping</span>
                    <span className="text-[#786848]">Calculated at checkout</span>
                  </div>
                </div>
                <div className="h-px bg-[#786848]/20 mb-5" />
                <div className="flex justify-between mb-6">
                  <span className="font-medium text-[#F8F8E8]">Total</span>
                  <span className="text-xl font-bold text-[#F8F8E8]">${subtotal.toFixed(2)}</span>
                </div>
                <Link
                  to="/checkout"
                  className="flex items-center justify-center w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 shadow-lg shadow-[#486838]/20"
                  style={{ background: '#486838', color: '#F8F8E8' }}
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/shop"
                  className="flex items-center justify-center w-full py-3 mt-3 rounded-xl text-sm text-[#786848] hover:text-[#F8F8E8] transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </ScrollReveal>
          </div>
        )}
      </div>
    </div>
  );
}
