
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Tailwind color class e.g. 'text-primary'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-primary' }) => {
  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'h-6 w-6';
      break;
    case 'md':
      sizeClasses = 'h-10 w-10';
      break;
    case 'lg':
      sizeClasses = 'h-16 w-16';
      break;
  }

  return (
    <div className={`flex justify-center items-center`}>
      <div className={`animate-spin rounded-full ${sizeClasses} border-t-2 border-b-2 ${color.replace('text-', 'border-')}`}></div>
    </div>
  );
};

export default LoadingSpinner;
    