import React from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../motion/ScrollReveal';
import { GlassPanel } from '../glass';

export const CraftHighlight: React.FC = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center flex-col-reverse lg:flex-row">
            {/* Content */}
            <div className="order-2 lg:order-1">
              <GlassPanel className="p-8 md:p-12">
                <span className="text-xs text-[#486838] font-semibold tracking-widest uppercase mb-4 block">The Craft</span>
                <h2 className="font-serif text-3xl md:text-5xl text-[#F8F8E8] mb-6 leading-tight">Watch the making</h2>
                <p className="text-[#786848] mb-8 text-base sm:text-lg leading-relaxed">
                  Step inside our studio and see how each piece is carefully formulated, poured, and packaged by hand. It's not just production; it's a labor of love.
                </p>
                <Link
                  to="/crafts"
                  className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium text-[#F8F8E8] border transition-colors hover:bg-white/10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(248, 248, 232, 0.2)',
                  }}
                >
                  View All Crafts
                </Link>
              </GlassPanel>
            </div>

            {/* Video Placeholder */}
            <div className="order-1 lg:order-2 aspect-[9/16] max-h-[80vh] w-full max-w-sm mx-auto rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] to-[#2a2a2a] border border-white/10 flex items-center justify-center group cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform duration-300">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="ml-2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
