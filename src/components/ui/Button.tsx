import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const buttonVariants = cva(
  'inline-flex items-center justify-center text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'text-white hover:bg-opacity-90 bg-[color:var(--surface-dark)] hover:bg-[#0f2e2e] shadow-sm hover:shadow-md',
        primary: 'text-white hover:opacity-80 bg-[color:var(--button-hover-color)]', // Renaming old default to primary or keeping both? Let's keep default as the MAIN one used. The user used surface-dark for login. I'll make default surface-dark to standardise.
        outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-900',
        destructive: 'text-white hover:opacity-80 bg-[color:var(--button-destructive-color)]',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
        info: 'bg-blue-600 text-white hover:bg-blue-700',
        link: 'text-[color:var(--surface-dark)] underline-offset-4 hover:underline !p-0 !h-auto', // Minimalist link style
        // Icon action variants for tables
        'icon-edit': 'border border-gray-300 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 p-2',
        'icon-delete': 'border border-gray-300 text-red-600 hover:text-red-800 hover:bg-red-50 p-2',
        'icon-view': 'border border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50 p-2',
      },
      size: {
        xs: 'h-6 px-2 text-xs',
        default: 'h-12 px-6 py-3 text-base', // Updating default to match inputs h-12
        sm: 'h-9 px-4 text-sm',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10 p-0',
      },
      shape: {
        default: 'rounded-lg',
        pill: 'rounded-full',
        square: 'rounded-none',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> { }

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={clsx(buttonVariants({ variant, size }), className)} {...props} />
  );
}
