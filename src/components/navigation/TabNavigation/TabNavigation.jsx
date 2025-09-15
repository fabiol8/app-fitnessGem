import React from 'react';
import TabButton from '../TabButton';

const TabNavigation = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  fixed = true,
  ...props
}) => {
  const baseClasses = 'bg-white border-t border-gray-200 shadow-lg';
  const fixedClasses = fixed ? 'fixed bottom-0 left-0 right-0 z-40' : '';

  const classes = `
    ${baseClasses}
    ${fixedClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <nav className={classes} {...props}>
      <div className="flex">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            icon={tab.icon}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            badge={tab.badge}
            disabled={tab.disabled}
          >
            {tab.label}
          </TabButton>
        ))}
      </div>
    </nav>
  );
};

export default TabNavigation;