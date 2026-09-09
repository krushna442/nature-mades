import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  scale?: number;
  className?: string;
  once?: boolean;
  threshold?: number;
}

export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.6,
  y = 40,
  scale = 0.97,
  className = '',
  once = true,
  threshold = 0.15,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal({ threshold, once });
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, scale }}
      animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y, scale }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerRevealProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
  childClassName?: string;
  threshold?: number;
}

export function StaggerReveal({
  children,
  staggerDelay = 0.1,
  className = '',
  childClassName = '',
  threshold = 0.1,
}: StaggerRevealProps) {
  const { ref, isVisible } = useScrollReveal({ threshold, once: true });
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className}>
        {children.map((child, i) => (
          <div key={i} className={childClassName}>{child}</div>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <motion.div
          key={i}
          className={childClassName}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.96 }}
          transition={{
            duration: 0.6,
            delay: i * staggerDelay,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
