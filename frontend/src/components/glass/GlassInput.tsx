import { forwardRef, type InputHTMLAttributes, useId } from 'react';

export interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  (
    {
      label,
      error,
      className = '',
      style = {},
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-white/80 ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-xl border border-solid px-4 py-2.5 text-base text-white
            outline-none transition-all duration-200
            placeholder:text-white/40
            focus:border-white/30 focus:bg-white/10
            ${error ? 'border-red-400/50 focus:border-red-400' : 'border-white/10'}
            ${className}
          `}
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            ...style,
          }}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {error && (
          <span id={errorId} className="text-sm text-red-400 ml-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
