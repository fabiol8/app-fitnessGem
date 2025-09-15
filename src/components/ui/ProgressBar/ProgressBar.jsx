import React from 'react';

const ProgressBar = ({
  value,
  max = 100,
  min = 0,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  className = '',
  animated = false,
  striped = false
}) => {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  const sizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  const variants = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-cyan-500',
    gradient: 'bg-gradient-to-r from-blue-500 to-purple-600'
  };

  const stripedClasses = striped
    ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:1rem_1rem]'
    : '';

  const animatedClasses = animated
    ? 'animate-pulse'
    : '';

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {label || `Progress`}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`
            ${sizes[size]}
            ${variants[variant]}
            ${stripedClasses}
            ${animatedClasses}
            rounded-full transition-all duration-500 ease-out
          `}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
        />
      </div>

      {/* Value display for specific ranges */}
      {showLabel && (
        <div className="mt-1 text-xs text-gray-500">
          {value} / {max}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;