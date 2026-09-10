import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Crafts', href: '/crafts' },
  { label: 'Orders', href: '/orders' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function GlassNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const itemCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  const openCart = useCartStore((s) => s.openCart);
  const { isAuthenticated, user, logout } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const glassStyle = {
    background: scrolled ? 'rgba(10, 10, 10, 0.75)' : 'rgba(10, 10, 10, 0.4)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid rgba(255, 255, 255, ${scrolled ? '0.12' : '0.08'})`,
    transition: 'background 0.3s, border-color 0.3s',
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[10] flex justify-center px-4 sm:px-6"
        style={{ paddingTop: '1rem' }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div
          className="flex items-center justify-between w-full max-w-6xl h-14 px-5 rounded-2xl"
          style={glassStyle}
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-1 text-xl  font-semibold tracking-tight shrink-0"
          >
           <img src='/logo.png' className='w-[180px]'/>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href ||
                (link.href !== '/' && location.pathname.startsWith(link.href));
              return (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-[#F8F8E8] bg-[#486838]/25 border border-[#486838]/40'
                        : 'text-[#786848] hover:text-[#F8F8E8] hover:bg-white/[0.05]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl text-[#786848] hover:text-[#F8F8E8] hover:bg-white/[0.05] transition-colors duration-200"
              aria-label={`Shopping cart, ${itemCount} items`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4.5 h-4.5 text-[10px] font-bold rounded-full bg-[#486838] text-[#F8F8E8] min-w-[18px]">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Desktop Auth Button */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/account"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#F8F8E8] bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.08] transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-[#486838]" />
                  <span className="truncate max-w-[100px]">{user?.name?.split(' ')[0] || 'Account'}</span>
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#786848] hover:text-[#F8F8E8] hover:bg-white/[0.04] transition-colors"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                to="/account"
                className="hidden sm:flex items-center px-4 py-1.5 rounded-xl text-sm font-medium text-[#F8F8E8] border border-white/[0.12] hover:bg-white/[0.06] transition-colors duration-200"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex md:hidden items-center justify-center w-10 h-10 rounded-xl text-[#786848] hover:text-[#F8F8E8] hover:bg-white/[0.05] transition-colors duration-200"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {mobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[9] md:hidden"
            initial={shouldReduceMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            {/* Menu Panel */}
            <motion.div
              className="absolute top-20 left-4 right-4 rounded-2xl p-6"
              style={{
                background: 'rgba(10, 10, 10, 0.92)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                          isActive
                            ? 'text-[#F8F8E8] bg-white/[0.08]'
                            : 'text-[#786848] hover:text-[#F8F8E8] hover:bg-white/[0.05]'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 pt-4 border-t border-white/[0.08]">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to="/account"
                      className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-medium text-[#F8F8E8] bg-white/[0.06] border border-white/[0.1] transition-colors"
                    >
                      My Account ({user?.name || 'Patron'})
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-xs font-medium text-[#786848] hover:text-[#F8F8E8] border border-white/[0.06] hover:bg-white/[0.03] transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/account"
                    className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-medium text-[#0A0A0A] bg-[#F8F8E8] hover:bg-white transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
