import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { fetchMyOrders, type OrderHistoryItem } from '../services/orderService';
import { ScrollReveal, StaggerReveal } from '../components/motion/ScrollReveal';
import { OrderStatusTracker } from '../components/orders/OrderStatusTracker';

export function OrdersPage() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (!isInitialized) return;

    if (isAuthenticated) {
      setLoading(true);
      fetchMyOrders()
        .then((data) => setOrders(data))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isInitialized]);

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter((o) => o.orderStatus.toLowerCase() === selectedStatus.toLowerCase());

  const totalSpent = orders.reduce((acc, curr) => acc + (curr.total || 0), 0);

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs text-[#786848]" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-[#F8F8E8] transition-colors">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/account" className="hover:text-[#F8F8E8] transition-colors">Account</Link>
            </li>
            <li>/</li>
            <li className="text-[#F8F8E8]">Orders</li>
          </ol>
        </nav>

        {/* Header banner */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-white/[0.08] gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#486838]">
                Patron Purchase History
              </span>
              <h1
                className="text-3xl sm:text-4xl font-bold text-[#F8F8E8] mt-2"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Your Orders
              </h1>
              <p className="text-sm text-[#786848] mt-1.5">
                Track handcrafted creations, view receipts, and monitor artisan shipments.
              </p>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-4 bg-white/[0.03] px-5 py-3 rounded-2xl border border-white/[0.08]">
                <div>
                  <span className="text-[11px] text-[#786848] block uppercase tracking-wider">Total Orders</span>
                  <span className="text-lg font-bold text-[#F8F8E8] font-mono">{orders.length}</span>
                </div>
                <div className="w-px h-8 bg-white/[0.08]" />
                <div>
                  <span className="text-[11px] text-[#786848] block uppercase tracking-wider">Invested in Craft</span>
                  <span className="text-lg font-bold text-[#486838] font-mono">${totalSpent.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Auth Loading State */}
        {!isInitialized || (isAuthenticated && loading) ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#486838] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-[#786848]">Retrieving your handcrafted order records...</p>
          </div>
        ) : !isAuthenticated ? (
          /* Not Authenticated State */
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
                <span className="text-2xl text-[#F8F8E8]">📦</span>
              </div>
              <h2
                className="text-2xl font-bold text-[#F8F8E8] mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Sign in to view orders
              </h2>
              <p className="text-sm text-[#786848] mb-6">
                Please log in to your NatureMades patron account to view your past orders and shipment status.
              </p>
              <Link
                to="/account"
                className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold text-[#0A0A0A] bg-[#F8F8E8] hover:bg-white transition-all duration-200"
              >
                Sign In to Account
              </Link>
            </div>
          </ScrollReveal>
        ) : orders.length === 0 ? (
          /* Empty Orders State */
          <ScrollReveal>
            <div
              className="rounded-3xl p-12 text-center max-w-xl mx-auto"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span className="text-4xl mb-4 block opacity-50">🌿</span>
              <h2
                className="text-2xl font-bold text-[#F8F8E8] mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                No orders placed yet
              </h2>
              <p className="text-sm text-[#786848] mb-6 max-w-md mx-auto">
                Explore our collection of hand-poured candles, botanical soaps, pure oils, and artisan woodwork.
              </p>
              <Link
                to="/shop"
                className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold text-[#0A0A0A] bg-[#F8F8E8] hover:bg-white transition-all duration-200"
              >
                Discover the Collection
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {/* Status Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {['all', 'processing', 'shipped', 'delivered'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                    selectedStatus === status
                      ? 'bg-[#486838] text-[#F8F8E8]'
                      : 'bg-white/[0.04] text-[#786848] hover:text-[#F8F8E8] border border-white/[0.06]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <StaggerReveal className="space-y-6">
              {filteredOrders.map((order) => (
                <div
                  key={order.id || order.orderNumber}
                  className="rounded-2xl p-6 transition-all duration-200 hover:border-white/[0.14]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-bold text-[#F8F8E8]">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#486838]/20 text-[#F8F8E8] border border-[#486838]/40 capitalize">
                        {order.orderStatus}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-[#786848] border border-white/[0.06]">
                        {order.deliveryMethod}
                      </span>
                    </div>

                    <div className="text-xs text-[#786848]">
                      Ordered on{' '}
                      <span className="text-[#F8F8E8]">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <OrderStatusTracker status={order.orderStatus} />

                  {/* Items List */}
                  <div className="py-4 space-y-3 divide-y divide-white/[0.04]">
                    {order.items.map((item, idx) => {
                      const itemSlug = item.slug || item.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      const initial = item.name ? item.name.charAt(0).toUpperCase() : '🌿';

                      return (
                        <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-4 text-sm">
                          <Link
                            to={`/product/${itemSlug}`}
                            className="flex items-center gap-3.5 group flex-1 min-w-0"
                          >
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.08] shrink-0 flex items-center justify-center relative">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                  onError={(e) => {
                                    // Remove image and show botanical initial fallback without looping
                                    const img = e.currentTarget;
                                    img.style.display = 'none';
                                    if (img.parentElement) {
                                      const fallback = img.parentElement.querySelector('.item-initial-fallback');
                                      if (fallback) (fallback as HTMLElement).style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div
                                className={`item-initial-fallback ${item.image ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-[#486838]/20 text-[#F8F8E8] font-bold text-lg font-heading`}
                              >
                                {initial}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-[#F8F8E8] group-hover:text-[#486838] transition-colors block truncate">
                                {item.name}
                              </span>
                              {item.description && (
                                <p className="text-xs text-[#786848] line-clamp-1 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-[#786848]">
                                  Qty: <strong className="text-[#F8F8E8] font-mono">{item.quantity}</strong>
                                </span>
                                <span className="text-[#786848] text-xs">•</span>
                                <span className="text-xs text-[#786848]">
                                  ₹{item.price.toFixed(2)} each
                                </span>
                              </div>
                            </div>
                          </Link>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-sm font-semibold text-[#F8F8E8] block">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                            <Link
                              to={`/product/${itemSlug}`}
                              className="text-[11px] text-[#486838] hover:underline"
                            >
                              View Product →
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Pricing Breakup & Summary */}
                  {(() => {
                    const subtotal = order.subtotal || 0;
                    // Standard retail breakdown: Base Price (items total before 5% tax), GST/Taxes, Shipping Fee, and Grand Total
                    const basePrice = parseFloat((subtotal * 0.95).toFixed(2));
                    const gstAmount = parseFloat((subtotal - basePrice).toFixed(2));
                    const shippingFee = order.shippingFee || 0;
                    const grandTotal = order.total || (subtotal + shippingFee);

                    return (
                      <div className="pt-4 border-t border-white/[0.06] space-y-3">
                        {/* Price Breakdown Grid */}
                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-[11px] text-[#786848] block">Base Price</span>
                            <span className="font-mono text-xs text-[#F8F8E8] font-medium">
                              ₹{basePrice.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-[#786848] block">GST & Taxes (5%)</span>
                            <span className="font-mono text-xs text-[#F8F8E8] font-medium">
                              ₹{gstAmount.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-[#786848] block">Shipping Fee</span>
                            <span className="font-mono text-xs text-[#F8F8E8] font-medium">
                              ₹{shippingFee.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-[#486838] block font-semibold">Grand Total</span>
                            <span className="font-mono text-sm text-[#F8F8E8] font-bold">
                              ₹{grandTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                          <div className="flex items-center gap-2 text-xs text-[#786848]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Payment Status: <strong className="text-[#F8F8E8] capitalize">{order.paymentStatus || 'Paid'}</strong></span>
                          </div>

                          <div className="flex items-center gap-3">
                            <Link
                              to="/shop"
                              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#0A0A0A] bg-[#F8F8E8] hover:bg-white transition-all shadow-sm"
                            >
                              Order Again
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </StaggerReveal>
          </div>
        )}
      </div>
    </div>
  );
}
