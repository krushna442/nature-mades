import { type ReactNode } from 'react';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { AeroShardsBackground } from '../background/AeroShardsBackground';
import { GlassNavbar } from '../navigation/GlassNavbar';
import { CartDrawer } from '../cart/CartDrawer';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { placement, progress } = useScrollProgress();

  return (
    <div className="relative min-h-screen" data-placement={placement} data-scroll-progress={progress.toFixed(2)}>
      {/* Fixed AeroShards Background */}
      <AeroShardsBackground placement={placement} />

      {/* Floating Navbar */}
      <GlassNavbar />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Main Content */}
      <main className="relative" style={{ zIndex: 2 }}>
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
