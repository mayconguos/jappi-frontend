import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

// Utility for merging tailwind classes safely
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0D8F75] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg active:scale-95 hover:-translate-y-0.5',
  {
    variants: {
      variant: {
        primary: 'bg-[#0D8F75] hover:bg-[#0A705C] text-white shadow-lg shadow-[#0D8F75]/20 border border-transparent',
        secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent shadow-none hover:translate-y-0 active:scale-100',
        destructive: 'bg-red-600 hover:bg-red-700 text-white border border-transparent shadow-lg shadow-red-600/20',
        link: 'text-[#0D8F75] underline-offset-4 hover:underline !p-0 !h-auto shadow-none hover:translate-y-0 active:scale-100',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 p-2', // Kept for compatibility with icon buttons
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
