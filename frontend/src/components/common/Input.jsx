import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  error,
  icon: Icon,
  isTextarea = false,
  rows = 4,
  className = '',
  required = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold tracking-wide text-memora-brown">
          {label} {required && <span className="text-[#c86d74]">*</span>}
        </label>
      )}

      <div className="relative rounded-2xl">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-memora-muted">
            <Icon className="w-4 h-4" />
          </div>
        )}

        {isTextarea ? (
          <textarea
            rows={rows}
            className={`w-full bg-[#fdfbf7] border ${
              error ? 'border-[#c86d74] focus:border-[#a8323e]' : 'border-[#e8dfd1] focus:border-[#e89da2]'
            } rounded-2xl px-4 py-3 text-sm text-memora-espresso placeholder-[#b5a396] focus:outline-none focus:ring-2 focus:ring-[#e89da2]/20 transition duration-150 resize-y ${
              Icon ? 'pl-10' : ''
            } ${className}`}
            {...props}
          />
        ) : (
          <input
            type={computedType}
            className={`w-full bg-[#fdfbf7] border ${
              error ? 'border-[#c86d74] focus:border-[#a8323e]' : 'border-[#e8dfd1] focus:border-[#e89da2]'
            } rounded-2xl px-4 py-2.5 text-sm text-memora-espresso placeholder-[#b5a396] focus:outline-none focus:ring-2 focus:ring-[#e89da2]/20 transition duration-150 ${
              Icon ? 'pl-10' : ''
            } ${isPassword ? 'pr-10' : ''} ${className}`}
            {...props}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-memora-muted hover:text-memora-brown transition"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-[#a8323e] font-medium pl-1">{error}</p>}
    </div>
  );
};

export default Input;
