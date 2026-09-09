import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'subtle' | 'medium' | 'prominent';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants = {
  subtle: {
    background: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  medium: {
    background: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  prominent: {
    background: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
  },
};

const paddings = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = 'medium',
      hover = false,
      padding = 'md',
      className = '',
      style = {},
      children,
      ...props
    },
    ref
  ) => {
    const glassStyle = variants[variant];
    const paddingClass = paddings[padding];
    const hoverClass = hover
      ? 'transition-all duration-300 hover:-translate-y-1 hover:brightness-110 hover:shadow-xl'
      : '';

    return (
      <div
        ref={ref}
        className={`rounded-2xl border border-solid ${paddingClass} ${hoverClass} ${className}`}
        style={{ ...glassStyle, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
