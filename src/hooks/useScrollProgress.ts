import { useState, useEffect, useCallback, useRef } from 'react';

export type AeroPlacement = 'full' | 'left' | 'center' | 'right';

export interface ScrollProgressResult {
  progress: number;
  placement: AeroPlacement;
  scrollY: number;
}

const PLACEMENT_MAP: { threshold: number; placement: AeroPlacement }[] = [
  { threshold: 0.20, placement: 'full' },
  { threshold: 0.45, placement: 'left' },
  { threshold: 0.70, placement: 'center' },
  { threshold: 1.00, placement: 'right' },
];

function getPlacement(progress: number): AeroPlacement {
  for (const { threshold, placement } of PLACEMENT_MAP) {
    if (progress <= threshold) return placement;
  }
  return 'right';
}

const getScrollMetrics = () => {
  if (typeof window === 'undefined') return { scrollY: 0, progress: 0 };

  const scrollY =
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    (document.scrollingElement ? document.scrollingElement.scrollTop : 0) ||
    0;

  const scrollHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    document.documentElement.offsetHeight,
    document.body.offsetHeight,
    document.scrollingElement ? document.scrollingElement.scrollHeight : 0,
    0
  );

  const clientHeight =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight ||
    1;

  const maxScroll = Math.max(scrollHeight - clientHeight, 1);
  const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

  return { scrollY, progress };
};

export function useScrollProgress(): ScrollProgressResult {
  const [state, setState] = useState<ScrollProgressResult>(() => {
    const { scrollY, progress } = getScrollMetrics();
    return {
      progress,
      placement: getPlacement(progress),
      scrollY,
    };
  });

  const rafRef = useRef<number>(0);
  const lastProgressRef = useRef<number>(state.progress);
  const lastPlacementRef = useRef<AeroPlacement>(state.placement);
  const lastScrollYRef = useRef<number>(state.scrollY);

  const updateScroll = useCallback(() => {
    const { scrollY, progress } = getScrollMetrics();
    const placement = getPlacement(progress);

    if (
      placement !== lastPlacementRef.current ||
      Math.abs(progress - lastProgressRef.current) > 0.002 ||
      Math.abs(scrollY - lastScrollYRef.current) > 10
    ) {
      lastPlacementRef.current = placement;
      lastProgressRef.current = progress;
      lastScrollYRef.current = scrollY;
      setState({ progress, placement, scrollY });
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        updateScroll();
        rafRef.current = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Initial updates to handle dynamically loaded content
    updateScroll();
    const timer1 = setTimeout(updateScroll, 100);
    const timer2 = setTimeout(updateScroll, 500);
    const timer3 = setTimeout(updateScroll, 1000);

    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
      document.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', onScroll);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateScroll]);

  return state;
}
