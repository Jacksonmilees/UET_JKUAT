import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  variant = 'text', 
  width = '100%', 
  height,
  count = 1,
  className = '',
}) => {
  const baseClass = 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer';
  
  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-2xl h-64',
  };

  const defaultHeights = {
    text: '1rem',
    circular: '3rem',
    rectangular: '8rem',
    card: '16rem',
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseClass} ${variants[variant]} ${className} ${count > 1 && i < count - 1 ? 'mb-2' : ''}`}
      style={{ 
        width, 
        height: height || defaultHeights[variant],
      }}
    />
  ));

  return <>{skeletons}</>;
};

export default Skeleton;
