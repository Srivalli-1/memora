import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98 select-none';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-2xl gap-2',
    lg: 'px-6 py-3 text-base rounded-2xl gap-2.5'
  };

  const variants = {
    primary:
      'bg-[#e89da2] hover:bg-[#dc8b91] text-white shadow-soft font-semibold border border-[#df9297]',
    secondary:
      'bg-[#fdfbf7] hover:bg-[#f5eee6] text-memora-espresso border border-[#e8dfd1] shadow-sm',
    ghost:
      'bg-transparent hover:bg-[#f0e8dc]/60 text-memora-brown',
    danger:
      'bg-[#fbeeed] hover:bg-[#f7d8dc] text-[#a8323e] border border-[#f4cfd3]',
    outline:
      'bg-transparent border border-[#d8cbb8] hover:border-[#c4b39b] text-memora-brown hover:bg-[#f8f2e8]'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
