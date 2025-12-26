
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  // Added variant to fix TypeScript error in components/ImageProcessor.tsx: Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps'.
  variant?: 'default' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'default', ...props }) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  // Apply variant-specific styles based on the variant prop
  const variantClasses = variant === 'outline'
    ? 'border border-slate-200 bg-transparent hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100'
    : 'bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600';
    
  const sizeClasses = 'h-10 py-2 px-4';

  return (
    <button className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};
