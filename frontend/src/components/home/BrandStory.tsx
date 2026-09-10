import React from 'react';
import { ScrollReveal } from '../motion/ScrollReveal';
import { GlassPanel } from '../glass';

export const BrandStory: React.FC = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <GlassPanel className="max-w-4xl mx-auto text-center p-8 md:p-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#486838] block mb-3">
              Guiding Philosophy
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-[#F8F8E8] mb-6 leading-tight">
              "We believe in the beauty of things made slowly, with care."
            </h2>
            <p className="text-[#786848] text-base md:text-lg max-w-2xl mx-auto mb-16 leading-relaxed">
              NatureMades is a dedication to natural living. Every element is chosen for its purity, crafted carefully to bring balance and harmony to your everyday life.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#486838]/20 flex items-center justify-center mb-4 text-[#486838] border border-[#486838]/30">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <h3 className="text-[#F8F8E8] font-medium text-lg mb-2">Natural</h3>
                <p className="text-xs sm:text-sm text-[#786848]">Sourced directly from the earth, free from harsh chemicals.</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#486838]/20 flex items-center justify-center mb-4 text-[#486838] border border-[#486838]/30">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                    <line x1="16" y1="8" x2="2" y2="22"></line>
                    <line x1="17.5" y1="15" x2="9" y2="15"></line>
                  </svg>
                </div>
                <h3 className="text-[#F8F8E8] font-medium text-lg mb-2">Handmade</h3>
                <p className="text-xs sm:text-sm text-[#786848]">Crafted by artisans in small batches for exceptional quality.</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#486838]/20 flex items-center justify-center mb-4 text-[#486838] border border-[#486838]/30">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <h3 className="text-[#F8F8E8] font-medium text-lg mb-2">Sustainable</h3>
                <p className="text-xs sm:text-sm text-[#786848]">Packaged mindfully with respect for our planet's future.</p>
              </div>
            </div>
          </GlassPanel>
        </ScrollReveal>
      </div>
    </section>
  );
};
