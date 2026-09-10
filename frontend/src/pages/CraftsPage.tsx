import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { crafts } from '../data/crafts';
import type { CraftVideo } from '../types';
import { ScrollReveal } from '../components/motion/ScrollReveal';

export function CraftsPage() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-[#486838] uppercase tracking-widest">The Craft</span>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F8F8E8] mt-3 mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Watch the Making
            </h1>
            <p className="text-[#786848] max-w-lg mx-auto">
              Every product has a story. See the hands, the tools, and the tradition behind our handcrafted collection.
            </p>
          </div>
        </ScrollReveal>

        {/* Craft Feed */}
        <div className="flex flex-col items-center gap-12 lg:gap-16">
          {crafts.map((craft: CraftVideo, index: number) => (
            <CraftCard key={craft.id} craft={craft} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CraftCardProps {
  craft: CraftVideo;
  index: number;
}

function CraftCard({ craft, index }: CraftCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isReversed = index % 2 === 1;

  return (
    <ScrollReveal delay={0.1}>
      <div
        ref={cardRef}
        className={`flex flex-col lg:flex-row items-center gap-6 lg:gap-10 w-full max-w-5xl mx-auto ${
          isReversed ? 'lg:flex-row-reverse' : ''
        }`}
      >
        {/* Video Placeholder */}
        <div className="w-full max-w-[340px] lg:max-w-[380px] shrink-0">
          <div
            className="relative aspect-[9/16] rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, #11140e 0%, ${isVisible ? '#1b2416' : '#141810'} 50%, #11140e 100%)`,
              border: isVisible ? '1px solid rgba(72, 104, 56, 0.4)' : '1px solid rgba(120, 104, 72, 0.2)',
              transition: 'border-color 0.5s, background 0.5s',
            }}
          >
            {/* Play Icon */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(72, 104, 56, 0.25)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(72, 104, 56, 0.4)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#F8F8E8" opacity="0.8">
                  <polygon points="8,5 20,12 8,19" />
                </svg>
              </div>
              <span className="text-xs text-[#786848] font-medium">{craft.duration}</span>
            </div>

            {/* Bottom overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 p-4"
              style={{
                background: 'linear-gradient(transparent, rgba(10,12,8,0.95))',
              }}
            >
              <span className="text-[10px] font-semibold text-[#486838] uppercase tracking-wider">{craft.category}</span>
              <h3 className="text-sm font-semibold text-[#F8F8E8] mt-1">{craft.title}</h3>
              <p className="text-xs text-[#786848] mt-1">by {craft.artisan}</p>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div
          className="flex-1 rounded-2xl p-6 lg:p-8 w-full"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(120, 104, 72, 0.2)',
          }}
        >
          <span className="text-xs font-semibold text-[#486838] uppercase tracking-wider">{craft.category}</span>
          <h3
            className="text-xl lg:text-2xl font-bold text-[#F8F8E8] mt-2 mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {craft.title}
          </h3>
          <p className="text-sm text-[#786848] leading-relaxed mb-4">{craft.description}</p>
          <p className="text-xs text-[#786848] mb-5">Artisan: <span className="text-[#F8F8E8]">{craft.artisan}</span></p>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110 shadow-md shadow-[#486838]/20"
            style={{
              background: '#486838',
              color: '#F8F8E8',
            }}
          >
            <span>Shop This Craft</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
}
