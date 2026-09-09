import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { submitOrder, type OrderConfirmation } from '../services/orderService';
import { ScrollReveal } from '../components/motion/ScrollReveal';

export function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const [shipping, setShipping] = useState(5.99);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderConfirmation | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await submitOrder({
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        },
        deliveryMethod: shipping === 12.99 ? 'Express' : 'Standard',
        items,
      });

      setOrderResult(res);
      clearCart();
    } catch (err) {
      console.error('Checkout failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(120, 104, 72, 0.25)',
  };

  if (orderResult) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <ScrollReveal>
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 rounded-full bg-[#486838]/20 flex items-center justify-center mx-auto mb-4 border border-[#486838]/50">
              <span className="text-2xl text-[#486838]">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-[#F8F8E8] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Order Confirmed!
            </h1>
            <p className="text-sm text-[#786848] mb-1">
              Order Reference: <span className="font-mono text-[#F8F8E8] font-medium">{orderResult.order.orderNumber}</span>
            </p>
            <p className="text-xs text-[#786848] mb-6">
              Total Charged: ${orderResult.order.total.toFixed(2)} • {orderResult.order.itemsCount} items
            </p>
            <Link
              to="/shop"
              className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 shadow-lg shadow-[#486838]/25"
              style={{ background: '#486838', color: '#F8F8E8' }}
            >
              Continue Shopping
            </Link>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#786848] mb-4">Your cart is empty</p>
          <Link to="/shop" className="text-sm text-[#486838] hover:underline font-medium">Browse products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h1 className="text-3xl font-bold text-[#F8F8E8] mb-10" style={{ fontFamily: 'var(--font-heading)' }}>
            Checkout
          </h1>
        </ScrollReveal>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Contact */}
              <ScrollReveal>
                <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(120, 104, 72, 0.2)' }}>
                  <h2 className="text-base font-semibold text-[#F8F8E8] mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      required
                      placeholder="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm text-[#F8F8E8] placeholder:text-[#786848] outline-none focus:ring-1 focus:ring-[#486838]"
                      style={inputStyle}
                    />
                    <input
                      placeholder="Phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm text-[#F8F8E8] placeholder:text-[#786848] outline-none focus:ring-1 focus:ring-[#486838]"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </ScrollReveal>

              {/* Shipping */}
              <ScrollReveal delay={0.05}>
                <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(120, 104, 72, 0.2)' }}>
                  <h2 className="text-base font-semibold text-[#F8F8E8] mb-4">Shipping Address</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        required
                        placeholder="First name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl text-sm text-[#F8F8E8] placeholder:text-[#786848] outline-none focus:ring-1 focus:ring-[#486838]"
                        style={inputStyle}
                      />
                      <input
                        required
                        placeholder="Last name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl text-sm text-[#F8F8E8] placeholder:text-[#786848] outline-none focus:ring-1 focus:ring-[#486838]"
                        style={inputStyle}
                      />
                    </div>
                    <input
                      required
                      placeholder="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm text-[#F8F8E8] placeholder:text-[#786848] outline-none focus:ring-1 focus:ring-[#486838]"
                      style={inputStyle}
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <input
                        required
                        placeholder="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl text-sm text-[#F8F8E8] placeholder:text-[#786848] outline-none focus:ring-1 focus:ring-[#486838]"
                        style={inputStyle}
                      />
                      <input
                        required
                        placeholder="State"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl text-sm text-[#F8F8E8] placeholder:text-[#786848] outline-none focus:ring-1 focus:ring-[#486838]"
                        style={inputStyle}
                      />
                      <input
                        required
                        placeholder="ZIP"
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl text-sm text-[#F8F8E8] placeholder:text-[#786848] outline-none focus:ring-1 focus:ring-[#486838] col-span-2 sm:col-span-1"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Delivery */}
              <ScrollReveal delay={0.1}>
                <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(120, 104, 72, 0.2)' }}>
                  <h2 className="text-base font-semibold text-[#F8F8E8] mb-4">Delivery</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Standard (5–7 days)', price: 5.99 },
                      { label: 'Express (2–3 days)', price: 12.99 },
                    ].map((opt) => (
                      <label
                        key={opt.price}
                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors ${
                          shipping === opt.price ? 'bg-[#486838]/15 border border-[#486838]/60' : 'border border-[#786848]/20 hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            checked={shipping === opt.price}
                            onChange={() => setShipping(opt.price)}
                            className="accent-[#486838]"
                          />
                          <span className="text-sm text-[#F8F8E8]">{opt.label}</span>
                        </div>
                        <span className="text-sm text-[#786848] font-medium">${opt.price.toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Payment */}
              <ScrollReveal delay={0.15}>
                <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(120, 104, 72, 0.2)' }}>
                  <h2 className="text-base font-semibold text-[#F8F8E8] mb-4">Payment</h2>
                  <div className="space-y-4">
                    <input
                      required
                      placeholder="Card number"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm text-[#F8F8E8] placeholder:text-[#786848] outline-none focus:ring-1 focus:ring-[#486838]"
                      style={inputStyle}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        required
                        placeholder="MM / YY"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl text-sm text-[#F8F8E8] placeholder:text-[#786848] outline-none focus:ring-1 focus:ring-[#486838]"
                        style={inputStyle}
                      />
                      <input
                        required
                        placeholder="CVV"
                        name="cardCvv"
                        value={formData.cardCvv}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl text-sm text-[#F8F8E8] placeholder:text-[#786848] outline-none focus:ring-1 focus:ring-[#486838]"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Order Summary */}
            <ScrollReveal delay={0.1} className="lg:col-span-2">
              <div
                className="rounded-2xl p-6 h-fit lg:sticky lg:top-28"
                style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(120, 104, 72, 0.2)' }}
              >
                <h2 className="text-base font-semibold text-[#F8F8E8] mb-5">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-[#786848] truncate max-w-[60%]">{item.product.name} × {item.quantity}</span>
                      <span className="text-[#F8F8E8]">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-[#786848]/20 mb-4" />
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#786848]">Subtotal</span>
                    <span className="text-[#F8F8E8] font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#786848]">Shipping</span>
                    <span className="text-[#F8F8E8] font-medium">${shipping.toFixed(2)}</span>
                  </div>
                </div>
                <div className="h-px bg-[#786848]/20 mb-4" />
                <div className="flex justify-between mb-6">
                  <span className="font-medium text-[#F8F8E8]">Total</span>
                  <span className="text-xl font-bold text-[#F8F8E8]">${(subtotal + shipping).toFixed(2)}</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#486838]/25"
                  style={{ background: '#486838', color: '#F8F8E8' }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#F8F8E8] border-t-transparent rounded-full animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </ScrollReveal>
          </div>
        </form>
      </div>
    </div>
  );
}
