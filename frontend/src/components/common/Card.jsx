import React from 'react';

/**
 * Standard Accessible Card component with 12px border radius and soft shadow
 */
export const Card = ({ children, className = '', hover = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-card border border-[#E2E8F0] shadow-soft ${
        hover
          ? 'transition-all duration-150 hover:shadow-soft-hover hover:border-[#CBD5E1] cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
