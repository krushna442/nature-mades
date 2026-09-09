import React from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../motion/ScrollReveal';
import { GlassPanel } from '../glass';

export const NaturalStory: React.FC = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Placeholder */}
            <div className="aspect-[4/5] lg:aspect-square rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0A] to-[#4A7C59]/30 border border-white/10 flex items-center justify-center">
                <span className="text-white/20 font-serif text-2xl">Natural Ingredients</span>
              </div>
            </div>
            
            {/* Content */}
            <div>
              <GlassPanel className="p-8 md:p-12">
                <span className="text-xs text-[#4A7C59] font-medium tracking-widest uppercase mb-4 block">Our Story</span>
                <h2 className="font-serif text-3xl md:text-5xl text-white mb-6 leading-tight">Rooted in nature.<br/>Crafted by hand.</h2>
                <div className="space-y-4 text-white/70 mb-8">
                  <p>
                    Every product we create begins with a deep respect for the earth. We source our ingredients responsibly, choosing botanical extracts, pure clays, and nourishing oils that support both your well-being and the environment.
                  </p>
                  <p>
                    Our artisanal process honors traditional methods. We believe that true quality takes time, which is why everything is crafted in small batches to ensure potency and freshness.
                  </p>
                </div>
                <Link
                  to="/about"
                  className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium text-white border transition-colors hover:bg-white/10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                  }}
                >
                  Learn More
                </Link>
              </GlassPanel>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
