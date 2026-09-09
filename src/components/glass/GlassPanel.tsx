import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'subtle' | 'medium' | 'prominent';
  children: ReactNode;
  maxWidth?: string;
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

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  (
    {
      variant = 'subtle',
      maxWidth,
      className = '',
      style = {},
      children,
      ...props
    },
    ref
  ) => {
    const glassStyle = variants[variant];
    
    return (
      <div
        ref={ref}
        className={`w-full border border-solid ${className}`}
        style={{
          ...glassStyle,
          maxWidth: maxWidth || 'none',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = 'GlassPanel';
