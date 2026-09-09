import { ScrollReveal, StaggerReveal } from '../components/motion/ScrollReveal';
import { Link } from 'react-router-dom';

const PROCESS_STEPS = [
  { icon: '🌿', title: 'Source', desc: 'We select the finest natural ingredients from trusted growers.' },
  { icon: '✋', title: 'Craft', desc: 'Every product is made by hand using traditional techniques.' },
  { icon: '🔬', title: 'Test', desc: 'Rigorous quality checks ensure purity and safety.' },
  { icon: '📦', title: 'Deliver', desc: 'Carefully packaged and shipped with care to your door.' },
];

const VALUES = [
  { title: 'Natural', desc: 'Only natural, ethically sourced ingredients. No synthetics, no shortcuts.' },
  { title: 'Sustainable', desc: 'Eco-friendly packaging and processes that respect the planet.' },
  { title: 'Handmade', desc: 'Every product carries the warmth and intention of human hands.' },
];

export function AboutPage() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <ScrollReveal>
          <div className="text-center mb-20 lg:mb-28">
            <span className="text-xs font-medium text-[#4A7C59] uppercase tracking-widest">About Us</span>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F0EB] mt-3 mb-5"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Rooted in Nature
            </h1>
            <p className="text-[#A8A29E] max-w-2xl mx-auto leading-relaxed">
              We believe the best things come from the earth, shaped by hand, and delivered with care.
              NatureMades was born from a simple idea: that handmade is better.
            </p>
          </div>
        </ScrollReveal>

        {/* Our Story */}
        <ScrollReveal>
          <div
            className="rounded-2xl p-8 lg:p-12 mb-20 max-w-4xl mx-auto"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <h2
              className="text-2xl font-bold text-[#F5F0EB] mb-5"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Our Story
            </h2>
            <div className="space-y-4 text-sm text-[#A8A29E] leading-relaxed">
              <p>
                It started in a small workshop with a handful of candles and a deep love for natural materials.
                What began as a passion project has grown into a community of artisans, each dedicated to their craft.
              </p>
              <p>
                Every product we make is a quiet rebellion against mass production. We take the time to source
                the best ingredients, work with skilled hands, and create products that bring warmth into everyday moments.
              </p>
              <p>
                From beeswax candles to handmade soaps, bamboo crafts to essential oils — each item is made slowly
                and intentionally, because we believe that's how the best things are made.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Process */}
        <div className="mb-20">
          <ScrollReveal>
            <h2
              className="text-2xl font-bold text-[#F5F0EB] text-center mb-10"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Our Process
            </h2>
          </ScrollReveal>
          <StaggerReveal
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            staggerDelay={0.1}
          >
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span className="text-3xl mb-3 block">{step.icon}</span>
                <h3 className="text-base font-semibold text-[#F5F0EB] mb-2">{step.title}</h3>
                <p className="text-xs text-[#A8A29E] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </StaggerReveal>
        </div>

        {/* Values */}
        <div className="mb-20">
          <ScrollReveal>
            <h2
              className="text-2xl font-bold text-[#F5F0EB] text-center mb-10"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Our Values
            </h2>
          </ScrollReveal>
          <StaggerReveal
            className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto"
            staggerDelay={0.12}
          >
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <h3 className="text-lg font-semibold text-[#F5F0EB] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  {value.title}
                </h3>
                <p className="text-sm text-[#A8A29E] leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </StaggerReveal>
        </div>

        {/* Quote */}
        <ScrollReveal>
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <blockquote>
              <p
                className="text-xl sm:text-2xl lg:text-3xl text-[#F5F0EB] leading-relaxed italic"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                "We believe in the beauty of things made slowly, with intention and care."
              </p>
            </blockquote>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-[#F5F0EB] mb-3">Ready to experience handmade?</h2>
            <p className="text-sm text-[#A8A29E] mb-6">Browse our handcrafted collection</p>
            <Link
              to="/shop"
              className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:translate-y-[-1px]"
              style={{ background: '#F5F0EB', color: '#0A0A0A' }}
            >
              Shop Now
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
