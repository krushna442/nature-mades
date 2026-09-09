import React from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../motion/ScrollReveal';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 lg:py-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#486838] block mb-3">
            Mindful Living
          </span>
          <h2 className="font-serif text-4xl md:text-6xl text-[#F8F8E8] mb-4">Start your natural journey</h2>
          <p className="text-base md:text-lg text-[#786848] mb-10 max-w-2xl mx-auto">
            Explore our handcrafted collection made with sustainable ingredients and intentional craft.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/shop"
              className="px-8 py-4 bg-[#486838] text-[#F8F8E8] font-semibold rounded-full hover:bg-[#5e844a] transition-all duration-200 w-full sm:w-auto shadow-lg shadow-[#486838]/20"
            >
              Shop Now
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 text-[#F8F8E8] font-medium rounded-full transition-colors hover:bg-white/10 border w-full sm:w-auto"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(248, 248, 232, 0.2)',
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
