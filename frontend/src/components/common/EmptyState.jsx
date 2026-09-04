import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-dashed border-[#d8cbb8] bg-[#fdfbf7]/80 my-6 shadow-sm ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-[#fbeeed] border border-[#f4cfd3] flex items-center justify-center text-[#c86d74] mb-4 shadow-sm">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h4 className="text-lg font-serif font-bold text-memora-espresso mb-1.5">{title}</h4>
      <p className="text-xs sm:text-sm text-memora-muted max-w-md mb-6 font-serif leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
