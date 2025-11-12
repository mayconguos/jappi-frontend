import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'text-white hover:opacity-80 [background-color:var(--button-hover-color)]',
        outline: 'border border-gray-300 text-gray-900 hover:bg-gray-100',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-900',
        destructive: 'text-white hover:opacity-80 [background-color:var(--button-destructive-color)]',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
        info: 'bg-blue-600 text-white hover:bg-blue-700',
        // Icon action variants for tables
        'icon-edit': 'border border-gray-300 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 p-2',
        'icon-delete': 'border border-gray-300 text-red-600 hover:text-red-800 hover:bg-red-50 p-2',
        'icon-view': 'border border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50 p-2',
      },
      size: {
        xs: 'h-6 px-2 text-xs',
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
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
