import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    relative overflow-hidden font-semibold rounded-xl 
    transition-all duration-300 transform 
    active:scale-95 
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-4
    ${fullWidth ? 'w-full' : ''}
  `;
  
  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-indigo-600 
      hover:from-blue-700 hover:to-indigo-700 
      text-white shadow-lg hover:shadow-xl
      focus:ring-blue-300
    `,
    secondary: `
      bg-white border-2 border-gray-300 
      hover:border-blue-500 hover:bg-blue-50
      text-gray-700 hover:text-blue-600 
      shadow-sm hover:shadow-md
      focus:ring-blue-200
    `,
    success: `
      bg-gradient-to-r from-green-600 to-emerald-600 
      hover:from-green-700 hover:to-emerald-700 
      text-white shadow-lg hover:shadow-xl
      focus:ring-green-300
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-pink-600 
      hover:from-red-700 hover:to-pink-700 
      text-white shadow-lg hover:shadow-xl
      focus:ring-red-300
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 
      text-gray-700 hover:text-gray-900
      focus:ring-gray-200
    `,
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} group`}
      disabled={disabled || loading}
      {...props}
    >
      {/* Ripple effect overlay */}
      <span className="absolute inset-0 overflow-hidden rounded-xl">
        <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
      </span>
      
      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && (
              <span className="transition-transform group-hover:scale-110 duration-200">
                {icon}
              </span>
            )}
            <span>{children}</span>
          </>
        )}
      </span>
    </button>
  );
};

export default Button;
