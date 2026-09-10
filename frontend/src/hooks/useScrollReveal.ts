import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

interface ScrollRevealResult {
  ref: React.RefObject<HTMLDivElement | null>;
  isVisible: boolean;
  hasBeenVisible: boolean;
}

export function useScrollReveal(options: ScrollRevealOptions = {}): ScrollRevealResult {
  const { threshold = 0.15, rootMargin = '0px', once = true } = options;
  const ref = useRef<HTMLDivElement | null>(null);
  const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [isVisible, setIsVisible] = useState(isReduced);
  const [hasBeenVisible, setHasBeenVisible] = useState(isReduced);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) return;

      if (entry.isIntersecting) {
        setIsVisible(true);
        setHasBeenVisible(true);
      } else if (!once) {
        setIsVisible(false);
      }
    },
    [once]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, handleIntersection]);

  return { ref, isVisible, hasBeenVisible };
}
