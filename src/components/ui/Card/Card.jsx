import React from 'react';

const Card = ({
  children,
  variant = 'default',
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = false,
  glass = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'rounded-xl transition-all duration-200';

  const variants = {
    default: 'bg-white border border-gray-200',
    primary: 'bg-blue-50 border border-blue-200',
    success: 'bg-green-50 border border-green-200',
    warning: 'bg-yellow-50 border border-yellow-200',
    danger: 'bg-red-50 border border-red-200'
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const glassClasses = glass
    ? 'backdrop-blur-md bg-white/30 border-white/20 shadow-xl'
    : variants[variant];

  const hoverClasses = hover ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const classes = `
    ${baseClasses}
    ${glass ? glassClasses : variants[variant]}
    ${paddings[padding]}
    ${shadows[shadow]}
    ${hoverClasses}
    ${clickableClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;