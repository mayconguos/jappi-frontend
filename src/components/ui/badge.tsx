import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#0D8F75] text-white shadow hover:bg-[#0D8F75]/80',
        secondary:
          'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200/80',
        destructive:
          'border-transparent bg-red-500 text-white shadow hover:bg-red-500/80',
        outline: 'text-gray-950 border-gray-200',
        // Variants for specific workflows (Pending, In Progress, etc.)
        success: 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
        warning: 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        info: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
