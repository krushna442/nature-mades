import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { fetchMyOrders, type OrderHistoryItem } from '../services/orderService';
import { ScrollReveal } from '../components/motion/ScrollReveal';

const TABS = ['Profile', 'Orders', 'Saved', 'Addresses'] as const;
type Tab = typeof TABS[number];

export function AccountPage() {
  const { user, isAuthenticated, isLoading, error, login, register, googleLogin, instagramLogin, logout, clearError } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('Profile');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoadingOrders(true);
      fetchMyOrders()
        .then((data) => setOrders(data))
        .finally(() => setIsLoadingOrders(false));
    }
  }, [isAuthenticated]);

  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      await login({ email, password });
    } else {
      await register({ name, email, password });
    }
  };

  const handleSimulateGoogle = async () => {
    const dummyGoogleToken = 'google-oauth-mock-id-token-' + Date.now();
    await googleLogin(dummyGoogleToken);
  };

  const handleSimulateInstagram = async () => {
    const igUsername = window.prompt('Enter your Instagram handle (e.g. artisan_crafter):', 'craft_lover');
    if (igUsername) {
      await instagramLogin({ username: igUsername });
    }
  };

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <ScrollReveal>
            <div
              className="rounded-3xl p-8 backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="text-center mb-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#486838]">
                  NatureMades Sanctuary
                </span>
                <h1
                  className="text-2xl sm:text-3xl font-bold text-[#F8F8E8] mt-2"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-xs text-[#786848] mt-1.5">
                  {authMode === 'login'
                    ? 'Sign in to access your orders and saved artisan crafts.'
                    : 'Join our handcrafted community today.'}
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex rounded-xl p-1 bg-white/[0.04] mb-6 border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    clearError();
                  }}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                    authMode === 'login'
                      ? 'bg-[#486838] text-[#F8F8E8] shadow-sm'
                      : 'text-[#786848] hover:text-[#F8F8E8]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    clearError();
                  }}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                    authMode === 'register'
                      ? 'bg-[#486838] text-[#F8F8E8] shadow-sm'
                      : 'text-[#786848] hover:text-[#F8F8E8]'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={handleSimulateGoogle}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-medium flex items-center justify-center gap-2.5 border border-white/[0.1] hover:bg-white/[0.05] transition-colors text-[#F8F8E8]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.54 0 2.94.57 4.03 1.51l3.03-3.03C17.21 1.74 14.77 1 12 1 7.37 1 3.4 3.78 1.54 7.78l3.69 2.86C6.12 7.75 8.81 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.28c0-.82-.07-1.61-.21-2.28H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.87c2.16-2 3.71-4.94 3.71-8.68z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.23 14.36c-.23-.69-.36-1.43-.36-2.36s.13-1.67.36-2.36L1.54 6.78C.56 8.74 0 10.8 0 12.98s.56 4.24 1.54 6.2l3.69-2.82z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.87c-1.07.72-2.45 1.16-4.22 1.16-3.19 0-5.88-2.75-6.77-5.64L1.54 15.6C3.4 19.6 7.37 23 12 23z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={handleSimulateInstagram}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-medium flex items-center justify-center gap-2.5 border border-white/[0.1] hover:bg-white/[0.05] transition-colors text-[#F8F8E8]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#E1306C]">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Continue with Instagram
                </button>
              </div>

              <div className="relative flex items-center justify-center mb-6">
                <div className="border-t border-white/[0.08] w-full" />
                <span className="bg-[#111111] px-3 text-[10px] uppercase tracking-wider text-[#786848] absolute">
                  Or with email
                </span>
              </div>

              {error && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmitAuth} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs text-[#786848] mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2.5 rounded-xl text-xs text-[#F8F8E8] placeholder:text-[#5e5038] outline-none focus:ring-1 focus:ring-[#486838]"
                      style={inputStyle}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-[#786848] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-[#F8F8E8] placeholder:text-[#5e5038] outline-none focus:ring-1 focus:ring-[#486838]"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#786848] mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-[#F8F8E8] placeholder:text-[#5e5038] outline-none focus:ring-1 focus:ring-[#486838]"
                    style={inputStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-xs font-semibold text-[#F8F8E8] bg-[#486838] hover:bg-[#5e844a] transition-colors disabled:opacity-50 mt-2 shadow-sm shadow-[#486838]/20"
                >
                  {isLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#486838]">
                Patron Dashboard
              </span>
              <h1
                className="text-3xl font-bold text-[#F8F8E8] mt-1"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                My Sanctuary
              </h1>
              <p className="text-xs text-[#786848] mt-1">
                Welcome back, <span className="text-[#F8F8E8] font-medium">{user?.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/orders"
                className="text-xs font-medium px-4 py-2 rounded-xl text-[#F8F8E8] bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] transition-colors"
              >
                View Orders Page →
              </Link>
              <button
                onClick={logout}
                className="text-xs font-medium px-4 py-2 rounded-xl text-[#786848] hover:text-[#F8F8E8] border border-white/[0.08] hover:bg-white/[0.04] transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Tabs */}
            <div className="flex border-b border-white/[0.06] overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'text-[#F8F8E8] border-b-2 border-[#486838]'
                      : 'text-[#786848] hover:text-[#F8F8E8]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 lg:p-8">
              {activeTab === 'Profile' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-4 pb-4 border-b border-[#786848]/20">
                    <div className="w-14 h-14 rounded-full bg-[#486838]/20 border border-[#486838]/40 flex items-center justify-center text-xl font-bold text-[#F8F8E8]">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h2 className="text-base font-medium text-[#F8F8E8]">{user?.name}</h2>
                      <p className="text-xs text-[#786848]">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-[#786848] uppercase tracking-wider">Account ID</span>
                      <p className="text-xs font-mono text-[#F8F8E8] mt-0.5">{user?.id}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#786848] uppercase tracking-wider">Default Status</span>
                      <p className="text-xs text-[#486838] mt-0.5 font-medium">Verified Handcrafted Patron</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Orders' && (
                <div>
                  {isLoadingOrders ? (
                    <div className="py-12 text-center">
                      <div className="inline-block w-6 h-6 border-2 border-[#486838] border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-xs text-[#786848]">Fetching your order records...</p>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-4 rounded-xl border border-[#786848]/20 bg-white/[0.02]"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-[#F8F8E8]">
                              {ord.orderNumber}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#486838]/20 text-[#F8F8E8] border border-[#486838]/40 font-medium">
                              {ord.orderStatus}
                            </span>
                          </div>
                          <div className="text-xs text-[#786848] mb-3">
                            Placed on {new Date(ord.createdAt).toLocaleDateString()} • {ord.deliveryMethod} Delivery
                          </div>
                          <div className="space-y-1 mb-3">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-[#786848]">{it.name} × {it.quantity}</span>
                                <span className="text-[#F8F8E8]">${(it.price * it.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-[#786848]/20 flex justify-between text-xs font-semibold">
                            <span className="text-[#786848]">Total Paid</span>
                            <span className="text-[#F8F8E8]">${ord.total.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon="📦" message="No orders placed yet" action="Explore Collection" link="/shop" />
                  )}
                </div>
              )}

              {activeTab === 'Saved' && (
                <EmptyState icon="♡" message="No saved products in your wishlist" action="Browse products" link="/shop" />
              )}

              {activeTab === 'Addresses' && (
                <EmptyState icon="📍" message="No addresses saved" action="Add an address" />
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

function EmptyState({ icon, message, action, link }: { icon: string; message: string; action: string; link?: string }) {
  return (
    <div className="text-center py-12">
      <span className="text-3xl mb-3 block opacity-40">{icon}</span>
      <p className="text-sm text-[#786848] mb-4">{message}</p>
      {link ? (
        <Link
          to={link}
          className="inline-flex px-5 py-2 rounded-xl text-sm font-medium text-[#F8F8E8] border border-[#786848]/30 hover:bg-[#486838]/20 transition-colors"
        >
          {action}
        </Link>
      ) : (
        <button className="px-5 py-2 rounded-xl text-sm font-medium text-[#F8F8E8] border border-[#786848]/30 hover:bg-[#486838]/20 transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}
