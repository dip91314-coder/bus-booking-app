import React from 'react';

/**
 * Standard Accessible Button component
 * @param {'primary' | 'secondary' | 'text'} variant
 * @param {React.ReactNode} children
 */
export const Button = ({
  variant = 'primary',
  children,
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-interactive min-h-[44px] px-5 py-2.5 text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B0F19] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[#5B21B6] dark:bg-purple-600 hover:bg-[#4C1D95] dark:hover:bg-purple-700 text-white shadow-soft active:bg-[#3B0764]',
    secondary:
      'bg-white dark:bg-[#111622] border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-slate-100 hover:bg-[#F8F7FC] dark:hover:bg-slate-800 hover:border-[#CBD5E1] dark:hover:border-slate-700 active:bg-[#F1F5F9]',
    text: 'bg-transparent text-[#5B21B6] dark:text-purple-400 hover:bg-[#F5F3FF] dark:hover:bg-purple-950/40 active:bg-[#EDE9FE]'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
