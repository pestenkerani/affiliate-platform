import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

function Loading({ message = 'Loading...', size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="relative w-full h-[100svh] box-border flex items-center justify-center text-2xl font-medium">
      <div role="status" aria-label="Loading" className="flex flex-col items-center gap-2">
        <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
        <div>{message}</div>
      </div>
    </div>
  );
}

export default Loading;
