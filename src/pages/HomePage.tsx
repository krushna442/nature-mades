import { HeroSection } from '../components/hero/HeroSection';
import { FeaturedCategories } from '../components/home/FeaturedCategories';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { NaturalStory } from '../components/home/NaturalStory';
import { CraftHighlight } from '../components/home/CraftHighlight';
import { BestSellers } from '../components/home/BestSellers';
import { BrandStory } from '../components/home/BrandStory';
import { TrustSection } from '../components/home/TrustSection';
import { FinalCTA } from '../components/home/FinalCTA';

export function HomePage() {
  return (
    <>
      {/* Hero — AeroShards = FULL */}
      <HeroSection />

      {/* Featured Categories — AeroShards transitions to LEFT */}
      <FeaturedCategories />

      {/* Featured Products — AeroShards at CENTER transition zone */}
      <FeaturedProducts />

      {/* Natural Story — editorial break */}
      <NaturalStory />

      {/* Craft Highlight — AeroShards toward RIGHT */}
      <CraftHighlight />

      {/* Best Sellers — AeroShards back toward CENTER */}
      <BestSellers />

      {/* Brand Story — AeroShards subtle */}
      <BrandStory />

      {/* Trust / Testimonials */}
      <TrustSection />

      {/* Final CTA */}
      <FinalCTA />
    </>
  );
}
