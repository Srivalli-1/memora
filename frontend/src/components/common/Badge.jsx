import React from 'react';

const Badge = ({ children, variant = 'blush', className = '' }) => {
  const variants = {
    blush: 'bg-[#fbeeed] text-[#b94a55] border-[#f4cfd3]',
    sage: 'bg-[#edf4ed] text-[#4d734e] border-[#cfdec0]',
    amber: 'bg-[#fef7ea] text-[#966b2d] border-[#fae2be]',
    parchment: 'bg-[#f5eee6] text-[#785438] border-[#e2cfbd]',
    blue: 'bg-[#edf1f5] text-[#4e6a82] border-[#c8d6e3]'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        variants[variant] || variants.blush
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
