import React from 'react';

/**
 * Standard Accessible Chip component
 */
export const Chip = ({
  children,
  active = false,
  onClick,
  className = '',
  size = 'md',
  ...props
}) => {
  const isClickable = !!onClick;
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm';

  return (
    <button
      type={isClickable ? 'button' : undefined}
      onClick={onClick}
      disabled={!isClickable}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6] ${sizeClasses} ${
        active
          ? 'bg-[#5B21B6] text-white shadow-sm'
          : isClickable
          ? 'bg-[#F8F7FC] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] border border-[#E2E8F0]'
          : 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Chip;
