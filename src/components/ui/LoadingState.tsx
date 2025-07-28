
import React from 'react';

interface LoadingStateProps {
  message?: string;
  duration?: number;
  variant?: 'default' | 'dots' | 'shimmer';
  size?: 'sm' | 'md' | 'lg';
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Hang tight - our AI is working",
  duration = 1.5,
  variant = 'default',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
        );
      
      case 'shimmer':
        return (
          <div className={`${sizeClasses[size]} bg-gray-200 rounded-full shimmer`}></div>
        );
      
      default:
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
            <div 
              className="absolute inset-2 border-t-4 border-primary/30 rounded-full animate-spin" 
              style={{ animationDuration: `${duration}s`, animationDirection: 'reverse' }}
            ></div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 space-y-4 animate-fade-in">
      {renderLoader()}
      <p className={`${textSizeClasses[size]} text-center text-charcoal font-medium max-w-md`}>
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
