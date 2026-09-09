import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
};

const variants = {
  primary: {
    className: 'bg-[#486838] text-[#F8F8E8] border-transparent font-medium shadow-md hover:brightness-110',
    style: {},
  },
  secondary: {
    className: 'text-[#F8F8E8] border-solid font-medium hover:bg-[#486838]/20 shadow-sm',
    style: {
      background: 'rgba(255,255,255,0.07)',
      borderColor: 'rgba(120, 104, 72, 0.25)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    },
  },
  ghost: {
    className: 'bg-transparent text-[#786848] hover:text-[#F8F8E8] border-transparent hover:bg-white/10 font-medium',
    style: {},
  },
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      className = '',
      style = {},
      children,
      icon,
      ...props
    },
    ref
  ) => {
    const sizeClass = sizes[size];
    const variantConfig = variants[variant];
    
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2 rounded-full border
          transition-all duration-200 hover:-translate-y-[1px]
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50
          disabled:opacity-50 disabled:pointer-events-none
          ${sizeClass} ${variantConfig.className} ${className}
        `}
        style={{ ...variantConfig.style, ...style }}
        {...props}
      >
        {icon && <span className="flex items-center justify-center">{icon}</span>}
        {children}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
