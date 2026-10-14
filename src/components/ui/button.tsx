import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'festive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-[15px] cursor-pointer';

    const variants = {
      primary:
        'bg-[#0d2818] text-white hover:bg-[#164228] focus-visible:ring-[#0d2818] shadow-sm',
      festive:
        'bg-[#d90429] text-white hover:bg-[#ef233c] focus-visible:ring-[#d90429] shadow-md shadow-red-500/20',
      secondary:
        'bg-[#edf2f4] text-[#2b2d42] hover:bg-[#e2e8f0] focus-visible:ring-[#2b2d42]',
      outline:
        'border-2 border-[#e5e7eb] bg-transparent text-[#2b2d42] hover:bg-[#f8f9fa] focus-visible:ring-[#0d2818]',
      ghost:
        'bg-transparent text-[#2b2d42] hover:bg-black/5 focus-visible:ring-[#0d2818]',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs',
      md: 'h-11 px-5 text-sm',
      lg: 'h-13 px-7 text-base font-semibold',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
