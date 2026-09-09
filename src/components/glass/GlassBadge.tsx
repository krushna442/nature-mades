import { type ReactNode } from 'react';

export interface GlassBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'accent';
  className?: string;
}

const variants = {
  default: {
    background: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  accent: {
    background: 'rgba(74,124,89,0.2)', // green-tinted
    borderColor: 'rgba(74,124,89,0.4)',
  },
};

export const GlassBadge = ({ 
  children, 
  variant = 'default',
  className = ''
}: GlassBadgeProps) => {
  const glassStyle = variants[variant];
  
  return (
    <span
      className={`
        inline-flex items-center justify-center px-3 py-1 rounded-full border border-solid
        text-xs font-medium text-white tracking-wide
        ${className}
      `}
      style={{
        ...glassStyle,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {children}
    </span>
  );
};
