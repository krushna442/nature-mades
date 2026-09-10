import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { fetchMyOrders, type OrderHistoryItem } from '../services/orderService';
import { sendOtpApi, resetPasswordApi } from '../services/authService';
import { ScrollReveal } from '../components/motion/ScrollReveal';

const TABS = ['Profile', 'Orders', 'Saved', 'Security'] as const;
type Tab = typeof TABS[number];

declare global {
  interface Window {
    google?: any;
  }
}

export function AccountPage() {
  const { user, isAuthenticated, isInitialized, isLoading, error, login, register, googleLogin, logout, clearError } = useAuthStore();
  const { wishlist, fetchWishlist, removeFromWishlist, toggleWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();

  const [activeTab, setActiveTab] = useState<Tab>('Profile');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Simulated Google Sign-In Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleSimEmail, setGoogleSimEmail] = useState('');
  const [googleSimName, setGoogleSimName] = useState('');
  const [googleSimLoading, setGoogleSimLoading] = useState(false);

  // Authenticated password update state (Security tab)
  const [profileOtp, setProfileOtp] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [profileOtpSent, setProfileOtpSent] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Initialize official Google Identity Services button
  useEffect(() => {
    if (isAuthenticated) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '242459998987-drnrqje6e1jl6d2v8op7li8dclkgdcf0.apps.googleusercontent.com';

    const renderGoogleBtn = () => {
      if (window.google?.accounts?.id && googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response?.credential) {
              await googleLogin({ credential: response.credential });
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 320,
        });
      }
    };

    if (window.google?.accounts?.id) {
      renderGoogleBtn();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          renderGoogleBtn();
          clearInterval(timer);
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated, authMode]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoadingOrders(true);
      fetchMyOrders()
        .then((data) => setOrders(data))
        .finally(() => setIsLoadingOrders(false));
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setRegisterSuccess(null);

    if (authMode === 'login') {
      const ok = await login({ email, password });
      if (ok) {
        // Check for pending wishlist item
        const pending = localStorage.getItem('nature-mades-pending-wishlist');
        if (pending) {
          try {
            const product = JSON.parse(pending);
            await toggleWishlist(product, true);
            localStorage.removeItem('nature-mades-pending-wishlist');
          } catch {
            // ignore
          }
        }
      }
    } else {
      const ok = await register({ name, email, password });
      if (ok) {
        setRegisterSuccess('Account created successfully! Please sign in with your credentials to access your dashboard.');
        setAuthMode('login');
        setPassword('');
      }
    }
  };

  const handleSimulateGoogle = () => {
    setGoogleSimEmail('');
    setGoogleSimName('');
    setShowGoogleModal(true);
  };

  const handleConfirmSimulateGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleSimEmail) return;
    setGoogleSimLoading(true);
    try {
      const ok = await googleLogin({
        email: googleSimEmail.trim(),
        name: googleSimName.trim() || googleSimEmail.split('@')[0],
      });
      if (ok) {
        setShowGoogleModal(false);
      }
    } finally {
      setGoogleSimLoading(false);
    }
  };

  // Send OTP for Forgot Password
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotMsg(null);
    try {
      const res = await sendOtpApi(forgotEmail);
      setForgotOtpSent(true);
      setForgotMsg({ text: res.message || 'OTP sent to your Gmail inbox!', type: 'success' });
    } catch (err: any) {
      setForgotMsg({ text: err.message || 'Failed to send OTP. Verify your email.', type: 'error' });
    } finally {
      setForgotLoading(false);
    }
  };

  // Verify OTP & Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotMsg({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    setForgotLoading(true);
    setForgotMsg(null);
    try {
      const res = await resetPasswordApi({
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: forgotNewPassword,
      });
      setForgotMsg({ text: res.message || 'Password reset! You can now log in.', type: 'success' });
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotOtpSent(false);
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setEmail(forgotEmail);
      }, 2000);
    } catch (err: any) {
      setForgotMsg({ text: err.message || 'Failed to reset password. Check OTP.', type: 'error' });
    } finally {
      setForgotLoading(false);
    }
  };

  // Send OTP for Logged-In Password Update
  const handleSendProfileOtp = async () => {
    if (!user?.email) return;
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await sendOtpApi(user.email);
      setProfileOtpSent(true);
      setProfileMsg({ text: res.message || 'OTP verification code sent to your Gmail!', type: 'success' });
    } catch (err: any) {
      setProfileMsg({ text: err.message || 'Failed to send OTP code.', type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Submit Password Update (Logged-In)
  const handleUpdateProfilePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    if (profileNewPassword !== profileConfirmPassword) {
      setProfileMsg({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await resetPasswordApi({
        email: user.email,
        otp: profileOtp,
        newPassword: profileNewPassword,
      });
      setProfileMsg({ text: res.message || 'Password updated successfully!', type: 'success' });
      setProfileOtpSent(false);
      setProfileOtp('');
      setProfileNewPassword('');
      setProfileConfirmPassword('');
    } catch (err: any) {
      setProfileMsg({ text: err.message || 'Verification failed. Please check your OTP.', type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#486838] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#786848]">Restoring your patron session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <ScrollReveal>
            <div
              className="rounded-3xl p-8 backdrop-blur-xl relative"
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

              {/* Success Notification after Signup */}
              {registerSuccess && (
                <div className="p-3.5 mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
                  <span className="text-sm leading-none mt-0.5">✓</span>
                  <div>
                    <span className="font-semibold block mb-0.5">Registration Successful</span>
                    <span>{registerSuccess}</span>
                  </div>
                </div>
              )}

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
                    setRegisterSuccess(null);
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

              {/* Google Sign-In with Google Identity Services */}
              <div className="mb-6 space-y-3">
                <div className="flex justify-center items-center w-full min-h-[44px]">
                  <div ref={googleButtonRef} className="w-full flex justify-center" />
                </div>

                {/* Fallback button if Google script is blocked or in preview */}
                <button
                  type="button"
                  onClick={handleSimulateGoogle}
                  className="w-full py-2 px-3 rounded-xl text-[11px] font-medium flex items-center justify-center gap-2 border border-white/[0.08] hover:bg-white/[0.04] transition-colors text-[#786848] hover:text-[#F8F8E8]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.54 0 2.94.57 4.03 1.51l3.03-3.03C17.21 1.74 14.77 1 12 1 7.37 1 3.4 3.78 1.54 7.78l3.69 2.86C6.12 7.75 8.81 5 12 5z" />
                    <path fill="#4285F4" d="M23.49 12.28c0-.82-.07-1.61-.21-2.28H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.87c2.16-2 3.71-4.94 3.71-8.68z" />
                    <path fill="#FBBC05" d="M5.23 14.36c-.23-.69-.36-1.43-.36-2.36s.13-1.67.36-2.36L1.54 6.78C.56 8.74 0 10.8 0 12.98s.56 4.24 1.54 6.2l3.69-2.82z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.87c-1.07.72-2.45 1.16-4.22 1.16-3.19 0-5.88-2.75-6.77-5.64L1.54 15.6C3.4 19.6 7.37 23 12 23z" />
                  </svg>
                  <span>Manual / Test Google Sign-In</span>
                </button>
                <p className="text-[10px] text-[#786848] text-center pt-1">
                  Patron authentication only. Administrators must sign in below using email &amp; password.
                </p>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-[#786848]">Password</label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotModal(true);
                          setForgotEmail(email);
                        }}
                        className="text-[11px] text-[#486838] hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
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

        {/* FORGOT PASSWORD MODAL (Gmail OTP) */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div
              className="max-w-md w-full p-6 sm:p-8 rounded-3xl relative"
              style={{
                background: '#0D0D0D',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-5">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#486838] font-semibold">Security Recovery</span>
                  <h3 className="text-lg font-bold text-[#F8F8E8]">Reset Password with Gmail OTP</h3>
                </div>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="text-[#786848] hover:text-[#F8F8E8]"
                >
                  ✕
                </button>
              </div>

              {forgotMsg && (
                <div
                  className={`p-3 rounded-xl text-xs mb-4 ${
                    forgotMsg.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-300 border border-red-500/20'
                  }`}
                >
                  {forgotMsg.text}
                </div>
              )}

              {!forgotOtpSent ? (
                <form onSubmit={handleSendForgotOtp} className="space-y-4">
                  <p className="text-xs text-[#786848]">
                    Enter your registered Gmail address. We will email a secure 6-digit verification code.
                  </p>
                  <div>
                    <label className="block text-xs text-[#786848] mb-1">Gmail / Email Address</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl text-xs text-[#F8F8E8] placeholder:text-[#5e5038] outline-none focus:border-[#486838] border border-white/[0.1] bg-white/[0.04]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#0A0A0A] bg-[#F8F8E8] hover:bg-white transition-all disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending OTP...' : 'Send OTP to Gmail'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-xs text-[#786848]">
                    Check your Gmail (<strong className="text-[#F8F8E8]">{forgotEmail}</strong>) for your 6-digit verification code.
                  </p>
                  <div>
                    <label className="block text-xs text-[#786848] mb-1">6-Digit Verification Code (OTP)</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full px-4 py-2.5 rounded-xl text-center tracking-widest font-mono text-base text-[#F8F8E8] placeholder:text-[#5e5038] outline-none focus:border-[#486838] border border-white/[0.1] bg-white/[0.04]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#786848] mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-2.5 rounded-xl text-xs text-[#F8F8E8] placeholder:text-[#5e5038] outline-none focus:border-[#486838] border border-white/[0.1] bg-white/[0.04]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#786848] mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-4 py-2.5 rounded-xl text-xs text-[#F8F8E8] placeholder:text-[#5e5038] outline-none focus:border-[#486838] border border-white/[0.1] bg-white/[0.04]"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotOtpSent(false)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-medium text-[#786848] bg-white/[0.04] hover:text-[#F8F8E8]"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-[#0A0A0A] bg-[#F8F8E8] hover:bg-white transition-all disabled:opacity-50"
                    >
                      {forgotLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Simulated Google Sign-In Account Selection Modal */}
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="w-full max-w-sm rounded-3xl p-6 sm:p-7 relative border border-white/10"
              style={{
                background: '#121212',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
              }}
            >
              <button
                onClick={() => setShowGoogleModal(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/[0.06] text-[#786848] hover:text-[#F8F8E8] flex items-center justify-center text-xs"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.54 0 2.94.57 4.03 1.51l3.03-3.03C17.21 1.74 14.77 1 12 1 7.37 1 3.4 3.78 1.54 7.78l3.69 2.86C6.12 7.75 8.81 5 12 5z" />
                    <path fill="#4285F4" d="M23.49 12.28c0-.82-.07-1.61-.21-2.28H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.87c2.16-2 3.71-4.94 3.71-8.68z" />
                    <path fill="#FBBC05" d="M5.23 14.36c-.23-.69-.36-1.43-.36-2.36s.13-1.67.36-2.36L1.54 6.78C.56 8.74 0 10.8 0 12.98s.56 4.24 1.54 6.2l3.69-2.82z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.87c-1.07.72-2.45 1.16-4.22 1.16-3.19 0-5.88-2.75-6.77-5.64L1.54 15.6C3.4 19.6 7.37 23 12 23z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F8F8E8]">Choose Google Account</h3>
                  <p className="text-[11px] text-[#786848]">Sign in to NatureMades</p>
                </div>
              </div>

              <form onSubmit={handleConfirmSimulateGoogle} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#786848] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={googleSimName}
                    onChange={(e) => setGoogleSimName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-[#F8F8E8] placeholder:text-[#5e5038] outline-none focus:border-[#486838] border border-white/[0.1] bg-white/[0.04]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#786848] mb-1">Google Email Address</label>
                  <input
                    type="email"
                    required
                    value={googleSimEmail}
                    onChange={(e) => setGoogleSimEmail(e.target.value)}
                    placeholder="e.g. john@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-[#F8F8E8] placeholder:text-[#5e5038] outline-none focus:border-[#486838] border border-white/[0.1] bg-white/[0.04]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-medium text-[#786848] bg-white/[0.04] hover:text-[#F8F8E8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={googleSimLoading || !googleSimEmail}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-[#0A0A0A] bg-[#F8F8E8] hover:bg-white transition-all disabled:opacity-50"
                  >
                    {googleSimLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-[#F8F8E8]"
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
                  {tab === 'Saved' && wishlist.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-[#486838] text-white">
                      {wishlist.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 lg:p-8">
              {/* Profile Tab */}
              {activeTab === 'Profile' && (
                <div className="space-y-6">
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
                      <span className="text-xs text-[#786848] uppercase tracking-wider">Patron Status</span>
                      <p className="text-xs text-[#486838] mt-0.5 font-medium">
                        {user?.role === 'admin' ? '⚡ Administrator' : 'Verified Handcrafted Patron'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-[#F8F8E8]">Password & Security</h3>
                      <p className="text-[11px] text-[#786848]">Manage your Gmail OTP password verification</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('Security')}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-[#F8F8E8] bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] transition-colors"
                    >
                      Update Password →
                    </button>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
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
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#486838]/20 text-[#F8F8E8] border border-[#486838]/40 font-medium capitalize">
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
                                <span className="text-[#F8F8E8]">₹{(it.price * it.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-[#786848]/20 flex justify-between text-xs font-semibold">
                            <span className="text-[#786848]">Total Paid</span>
                            <span className="text-[#F8F8E8]">₹{ord.total.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon="📦" message="No orders placed yet" action="Explore Collection" link="/shop" />
                  )}
                </div>
              )}

              {/* Saved (Wishlist) Tab */}
              {activeTab === 'Saved' && (
                <div>
                  {wishlist.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                        <span className="text-xs text-[#786848]">
                          You have <strong className="text-[#F8F8E8]">{wishlist.length}</strong> saved creations
                        </span>
                        <Link to="/wishlist" className="text-xs text-[#486838] hover:underline">
                          Open full Wishlist page →
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {wishlist.map((item) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.images?.[0] || '/images/categories/candles.jpg'}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover bg-black/40 border border-white/10"
                              />
                              <div>
                                <Link
                                  to={`/product/${item.slug}`}
                                  className="text-xs font-medium text-[#F8F8E8] hover:text-[#486838] block line-clamp-1"
                                >
                                  {item.name}
                                </Link>
                                <span className="text-xs font-mono text-[#F8F8E8]">₹{item.price.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  addItem(item);
                                  openCart();
                                }}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#486838] text-white hover:bg-[#5a8247]"
                              >
                                Move to Cart
                              </button>
                              <button
                                onClick={() => removeFromWishlist(item.id)}
                                className="p-1.5 rounded-lg text-xs text-red-400 hover:bg-white/[0.05]"
                                title="Remove"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptyState icon="♡" message="No saved products in your wishlist" action="Browse products" link="/shop" />
                  )}
                </div>
              )}

              {/* Security & Password Tab (Gmail OTP) */}
              {activeTab === 'Security' && (
                <div className="max-w-md space-y-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#486838] font-semibold">Security Setting</span>
                    <h3 className="text-lg font-bold text-[#F8F8E8] mt-0.5">Update Password with Gmail OTP</h3>
                    <p className="text-xs text-[#786848] mt-1">
                      To protect your account, we send a one-time verification code to your registered Gmail address before changing your password.
                    </p>
                  </div>

                  {profileMsg && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs flex items-start gap-2 ${
                        profileMsg.type === 'success'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-300 border border-red-500/20'
                      }`}
                    >
                      <span>{profileMsg.type === 'success' ? '✓' : '⚠️'}</span>
                      <span>{profileMsg.text}</span>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-xs text-[#786848] block mb-1">Registered Gmail</span>
                    <span className="text-xs font-mono font-medium text-[#F8F8E8]">{user?.email}</span>
                  </div>

                  {!profileOtpSent ? (
                    <button
                      onClick={handleSendProfileOtp}
                      disabled={profileLoading}
                      className="w-full py-3 rounded-xl text-xs font-semibold text-[#0A0A0A] bg-[#F8F8E8] hover:bg-white transition-all disabled:opacity-50"
                    >
                      {profileLoading ? 'Sending OTP to Gmail...' : 'Send Verification OTP to Gmail'}
                    </button>
                  ) : (
                    <form onSubmit={handleUpdateProfilePassword} className="space-y-4">
                      <div>
                        <label className="block text-xs text-[#786848] mb-1">
                          6-Digit OTP (Check your Gmail inbox)
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={profileOtp}
                          onChange={(e) => setProfileOtp(e.target.value)}
                          placeholder="123456"
                          className="w-full px-4 py-2.5 rounded-xl text-center font-mono tracking-widest text-base text-[#F8F8E8] bg-white/[0.04] border border-white/[0.1] outline-none focus:border-[#486838]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-[#786848] mb-1">New Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={profileNewPassword}
                          onChange={(e) => setProfileNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full px-4 py-2.5 rounded-xl text-xs text-[#F8F8E8] bg-white/[0.04] border border-white/[0.1] outline-none focus:border-[#486838]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-[#786848] mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={profileConfirmPassword}
                          onChange={(e) => setProfileConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          className="w-full px-4 py-2.5 rounded-xl text-xs text-[#F8F8E8] bg-white/[0.04] border border-white/[0.1] outline-none focus:border-[#486838]"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setProfileOtpSent(false)}
                          className="flex-1 py-2.5 rounded-xl text-xs font-medium text-[#786848] bg-white/[0.04] hover:text-[#F8F8E8]"
                        >
                          Resend OTP
                        </button>
                        <button
                          type="submit"
                          disabled={profileLoading}
                          className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-[#0A0A0A] bg-[#F8F8E8] hover:bg-white transition-all disabled:opacity-50"
                        >
                          {profileLoading ? 'Updating...' : 'Save New Password'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
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
