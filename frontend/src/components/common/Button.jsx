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
    'inline-flex items-center justify-center font-medium rounded-interactive min-h-[44px] px-5 py-2.5 text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[#5B21B6] hover:bg-[#4C1D95] text-white shadow-soft active:bg-[#3B0764]',
    secondary:
      'bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8F7FC] hover:border-[#CBD5E1] active:bg-[#F1F5F9]',
    text: 'bg-transparent text-[#5B21B6] hover:bg-[#F5F3FF] active:bg-[#EDE9FE]'
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
