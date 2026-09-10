import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { useEffect } from 'react';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const shouldReduceMotion = useReducedMotion();

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeCart();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[20]" role="dialog" aria-label="Shopping cart" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={shouldReduceMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            className="absolute top-0 right-0 h-full w-full max-w-md flex flex-col"
            style={{
              background: 'rgba(15, 15, 15, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
            }}
            initial={shouldReduceMotion ? undefined : { x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#786848]/15">
              <h2 className="text-lg font-semibold text-[#F8F8E8]">
                Cart ({itemCount})
              </h2>
              <button
                onClick={closeCart}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-[#786848] hover:text-[#F8F8E8] hover:bg-[#486838]/20 transition-colors"
                aria-label="Close cart"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(120, 104, 72, 0.4)" strokeWidth="1">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  <p className="mt-4 text-[#786848] text-sm">Your cart is empty</p>
                  <Link
                    to="/shop"
                    onClick={closeCart}
                    className="mt-4 px-5 py-2 rounded-xl text-sm font-medium text-[#F8F8E8] border border-[#786848]/30 hover:bg-[#486838]/20 transition-colors"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 p-3 rounded-xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(120, 104, 72, 0.15)',
                      }}
                    >
                      {/* Image placeholder */}
                      <div
                        className="w-20 h-20 rounded-lg shrink-0 flex items-center justify-center text-xl font-bold text-[#F8F8E8]/15 border border-[#786848]/20"
                        style={{
                          background: 'linear-gradient(135deg, #12150f 0%, #1e2417 100%)',
                        }}
                      >
                        {item.product.name[0]}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium text-[#F8F8E8] hover:text-[#486838] line-clamp-1 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-[#786848] mt-0.5">
                          ₹{item.product.price.toFixed(2)}
                        </p>

                        {/* Quantity */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-xs text-[#786848] hover:text-[#F8F8E8] border border-[#786848]/20 hover:bg-[#486838]/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="text-sm text-[#F8F8E8] w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-xs text-[#786848] hover:text-[#F8F8E8] border border-[#786848]/20 hover:bg-[#486838]/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>

                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="ml-auto text-xs text-[#786848] hover:text-red-400 transition-colors"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-[#786848]/15">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-[#786848]">Subtotal</span>
                  <span className="text-lg font-semibold text-[#F8F8E8]">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold transition-colors duration-200 shadow-md shadow-[#486838]/20"
                  style={{
                    background: '#486838',
                    color: '#F8F8E8',
                  }}
                >
                  Checkout
                </Link>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="flex items-center justify-center w-full py-3 mt-2 rounded-xl text-sm font-medium text-[#786848] hover:text-[#F8F8E8] border border-[#786848]/20 hover:bg-[#486838]/10 transition-colors"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
