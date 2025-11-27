import React from 'react';

interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
  className?: string;
  gradient?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  hover = true, 
  onClick, 
  className = '',
  gradient = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-md overflow-hidden
        transition-all duration-300
        ${hover ? 'hover:shadow-2xl hover:-translate-y-2' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${gradient ? 'relative' : ''}
        ${className}
      `}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;
