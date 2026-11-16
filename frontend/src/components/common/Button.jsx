import React from 'react';
import { LoaderCircle } from 'lucide-react';

/**
 * Standard Accessible Button component
 * @param {'primary' | 'secondary' | 'danger' | 'text'} variant
 * @param {React.ReactNode} children
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl min-h-[44px] px-5 py-2.5 text-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B0F19] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

  const variants = {
    primary: 'bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm',
    secondary:
      'bg-white dark:bg-[#111622] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
    text: 'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
  };

  const sizes = {
    sm: 'min-h-[36px] px-3 py-1.5 text-xs',
    md: '',
    lg: 'min-h-[48px] px-6 py-3 text-base',
    icon: 'min-h-[36px] min-w-[36px] p-2'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading || undefined}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
};

export default Button;
