import React from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal, StaggerReveal } from '../motion/ScrollReveal';
import { GlassCard } from '../glass';
import { categories } from '../../data/categories';

export const FeaturedCategories: React.FC = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-12 text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#486838] block mb-2">
              Curated Essentials
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#F8F8E8] mb-3">Explore Our Collections</h2>
            <p className="text-[#786848] max-w-2xl text-sm sm:text-base">Discover natural products curated for your daily wellness.</p>
          </div>
        </ScrollReveal>

        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} to={`/shop?category=${category.slug}`} className="group block">
              <GlassCard className="h-full flex flex-col p-6 transition-transform duration-300 group-hover:-translate-y-1">
                <div className="aspect-video w-full mb-6 rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#486838]/20 to-transparent flex items-center justify-center">
                    <span className="text-4xl font-serif text-[#F8F8E8]/40">{category.name.charAt(0)}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between flex-1">
                  <div>
                    <h3 className="text-xl font-serif text-[#F8F8E8] mb-1.5">{category.name}</h3>
                    <p className="text-xs sm:text-sm text-[#786848] leading-relaxed">{category.description}</p>
                  </div>
                  <div className="text-[#786848] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#F8F8E8]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
};
