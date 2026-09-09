import React from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../motion/ScrollReveal';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 lg:py-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2 className="font-serif text-4xl md:text-6xl text-white mb-6">Start your natural journey</h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Explore our handcrafted collection
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/shop"
              className="px-8 py-4 bg-[#F5F0EB] text-[#0A0A0A] font-medium rounded-full hover:bg-white transition-colors w-full sm:w-auto"
            >
              Shop Now
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 text-white font-medium rounded-full transition-colors hover:bg-white/10 border w-full sm:w-auto"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
              }}
            >
              Learn Our Story
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
