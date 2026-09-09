import { Link } from 'react-router-dom';

const FOOTER_LINKS = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Candles', href: '/shop?category=candles' },
    { label: 'Soaps', href: '/shop?category=soaps' },
    { label: 'Essential Oils', href: '/shop?category=oils' },
    { label: 'Gift Sets', href: '/shop?category=gift-sets' },
  ],
  Explore: [
    { label: 'Crafts', href: '/crafts' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  Support: [
    { label: 'Shipping', href: '/contact' },
    { label: 'Returns', href: '/contact' },
    { label: 'FAQ', href: '/contact' },
  ],
};

export function Footer() {
  return (
    <footer
      className="relative"
      style={{
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block text-xl font-semibold tracking-tight">
              <span className="text-[#F5F0EB]">Nature</span>
              <span className="text-[#4A7C59] font-bold">Mades</span>
            </Link>
            <p className="mt-3 text-sm text-[#78716C] leading-relaxed max-w-xs">
              Handcrafted essentials made with natural ingredients and timeless craft. Every product tells a story.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-5">
              {['Instagram', 'Twitter', 'Pinterest'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-[#78716C] hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-colors duration-200"
                  aria-label={social}
                >
                  <span className="text-xs font-medium">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-[#F5F0EB] tracking-wide uppercase mb-4">
                {title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-[#78716C] hover:text-[#A8A29E] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#78716C]">
            © {new Date().getFullYear()} NatureMades. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-[#78716C] hover:text-[#A8A29E] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-[#78716C] hover:text-[#A8A29E] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
