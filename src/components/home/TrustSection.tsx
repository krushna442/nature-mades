import React from 'react';
import { ScrollReveal, StaggerReveal } from '../motion/ScrollReveal';
import { GlassCard } from '../glass';

const testimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    quote: "The quality is simply unmatched. These products have completely transformed my daily routine.",
    rating: 5
  },
  {
    id: 2,
    name: 'Emma L.',
    quote: "I love knowing that everything is natural and handmade. You can really feel the difference.",
    rating: 5
  },
  {
    id: 3,
    name: 'James C.',
    quote: "Beautiful packaging and incredible scents. Highly recommend to anyone looking for clean products.",
    rating: 5
  }
];

export const TrustSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-32 bg-[#0A0A0A]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Loved by our community</h2>
          </div>
        </ScrollReveal>

        <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <GlassCard key={testimonial.id} className="p-8 flex flex-col h-full">
              <div className="flex gap-1 text-[#F5F0EB] mb-6">
                {'★'.repeat(testimonial.rating)}
              </div>
              <p className="text-white/80 text-lg mb-8 flex-1 italic">
                "{testimonial.quote}"
              </p>
              <div className="text-white font-medium">
                — {testimonial.name}
              </div>
            </GlassCard>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
};
