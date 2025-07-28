
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  variant?: 'default' | 'dots' | 'pulse';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'border-primary',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const dotSizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  if (variant === 'dots') {
    return (
      <div className="loading-dots">
        <div className={`${dotSizeClasses[size]} bg-primary rounded-full`}></div>
        <div className={`${dotSizeClasses[size]} bg-primary rounded-full`}></div>
        <div className={`${dotSizeClasses[size]} bg-primary rounded-full`}></div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} bg-primary rounded-full pulse-subtle`}></div>
    );
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-t-2 ${color} ${sizeClasses[size]}`}></div>
  );
};

export default LoadingSpinner;
