import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassBadge } from '../glass';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          {/* <GlassBadge>✦ HANDCRAFTED COLLECTION</GlassBadge> */}
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-serif text-2xl sm:text-7xl text-gray-400] tracking-tight mb-6 whitespace-pre-line"
          style={{
            lineHeight: 1.1,
          }}
        >
          {`Naturally made.\nBeautifully yours.`}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-white/70 text-lg sm:text-sm max-w-2xl mx-auto mb-10"
        >
          Discover handcrafted essentials made with natural ingredients and timeless craft.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4  "
        >
          <Link
            to="/shop"
            className="px-8 py-3.5 bg-[#F5F0EB] text-[#0A0A0A] font-medium rounded-full hover:bg-white transition-colors"
          >
            Shop Collection
          </Link>
          <Link
            to="/crafts"
            className="px-8 py-3.5 text-white font-medium rounded-full transition-colors hover:bg-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            Explore Crafts
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-white/60"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
};
