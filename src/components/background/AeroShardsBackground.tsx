import { useMemo } from 'react';
import AeroShards from '../../AeroShards';
import type { AeroPlacement } from '../../hooks/useScrollProgress';

interface AeroShardsBackgroundProps {
  placement: AeroPlacement;
  className?: string;
}

export function AeroShardsBackground({ placement, className = '' }: AeroShardsBackgroundProps) {
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  if (prefersReducedMotion) {
    return (
      <div
        className={`fixed inset-0 ${className}`}
        style={{
          zIndex: 0,
          background: 'radial-gradient(ellipse at 50% 40%, #111 0%, #0A0A0A 100%)',
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`fixed inset-0 ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <AeroShards
        backgroundColor="#0A0A0A"
        shardColor="#4A7C59"
        accentColor="#5C9A6F"
        placement={placement}
        flow="stream"
        material="pearl"
        detail="balanced"
        effect="none"
        scale={0.7}
        spread={0.9}
        depth={0.8}
        speed={0.6}
        spin={0.5}
        interaction="repel"
        density={1.2}
        shardSize={1.0}
        stretch={1}
        turbulence={0.6}
        glow={0.8}
        edgeSoftness={2}
        bloom={0.4}
        grain={0.03}
        chromaticAberration={0.004}
        transitionDuration={1.2}
        interactionRadius={1.2}
        interactionStrength={0.4}
        rippleIntensity={0.8}
        holdToGather
        paused={false}
      />
    </div>
  );
}
