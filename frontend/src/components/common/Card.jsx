import React from 'react';

/**
 * Standard Accessible Card component with border radius and soft shadow
 */
export const Card = ({ children, className = '', hover = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#111622] text-[#0F172A] dark:text-slate-100 rounded-card border border-[#E2E8F0] dark:border-slate-800 shadow-soft transition-colors duration-200 ${
        hover
          ? 'transition-all duration-150 hover:shadow-soft-hover hover:border-[#CBD5E1] dark:hover:border-slate-700 cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
