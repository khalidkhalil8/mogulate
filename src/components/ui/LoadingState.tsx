
import React from 'react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Hang tight - our AI is working" 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-fade-in">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 border-t-4 border-teal-500 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-t-4 border-teal-300 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
      </div>
      <p className="text-lg text-center text-charcoal font-medium">{message}</p>
    </div>
  );
};

export default LoadingState;
