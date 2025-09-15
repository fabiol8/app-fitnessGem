import React from 'react';

const TabButton = ({
  children,
  icon,
  isActive = false,
  onClick,
  className = '',
  disabled = false,
  badge,
  ...props
}) => {
  const baseClasses = 'flex-1 flex flex-col items-center justify-center py-2 px-1 text-center transition-all duration-200';

  const stateClasses = isActive
    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50';

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer';

  const classes = `
    ${baseClasses}
    ${stateClasses}
    ${disabledClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      type="button"
      {...props}
    >
      <div className="relative">
        {icon && (
          <div className={`text-xl mb-1 ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
            {icon}
          </div>
        )}

        {badge && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {badge}
          </div>
        )}
      </div>

      {children && (
        <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
          {children}
        </span>
      )}
    </button>
  );
};

export default TabButton;