import React from 'react';
import { createPortal } from 'react-dom';
import { useNotifications, NOTIFICATION_POSITIONS } from '../../contexts/NotificationContext';
import Toast from './Toast';

const NotificationContainer = () => {
  const { notifications, config, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  const getPositionStyles = () => {
    const baseStyles = "fixed z-50 pointer-events-none";

    switch (config.position) {
      case NOTIFICATION_POSITIONS.TOP_RIGHT:
        return `${baseStyles} top-4 right-4`;
      case NOTIFICATION_POSITIONS.TOP_LEFT:
        return `${baseStyles} top-4 left-4`;
      case NOTIFICATION_POSITIONS.BOTTOM_RIGHT:
        return `${baseStyles} bottom-4 right-4`;
      case NOTIFICATION_POSITIONS.BOTTOM_LEFT:
        return `${baseStyles} bottom-4 left-4`;
      case NOTIFICATION_POSITIONS.TOP_CENTER:
        return `${baseStyles} top-4 left-1/2 transform -translate-x-1/2`;
      case NOTIFICATION_POSITIONS.BOTTOM_CENTER:
        return `${baseStyles} bottom-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseStyles} top-4 right-4`;
    }
  };

  const container = (
    <div className={getPositionStyles()}>
      <div className="pointer-events-auto space-y-2 w-full max-w-sm">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            config={config}
          />
        ))}
      </div>
    </div>
  );

  // Render to body to avoid z-index issues
  return typeof document !== 'undefined'
    ? createPortal(container, document.body)
    : null;
};

export default NotificationContainer;