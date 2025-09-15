import React, { useEffect, useState } from 'react';
import { NOTIFICATION_TYPES } from '../../contexts/NotificationContext';

const Toast = ({
  notification,
  onRemove,
  config
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Show animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto-hide if enabled
    let hideTimer;
    if (notification.autoHide && config.autoHideDuration > 0) {
      hideTimer = setTimeout(() => {
        handleRemove();
      }, config.autoHideDuration);
    }

    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [notification.autoHide, config.autoHideDuration]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300); // Match exit animation duration
  };

  const getTypeStyles = () => {
    const baseStyles = "border-l-4 shadow-lg backdrop-blur-sm";

    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return `${baseStyles} bg-green-50 border-green-400 text-green-800`;
      case NOTIFICATION_TYPES.ERROR:
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
      case NOTIFICATION_TYPES.WARNING:
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case NOTIFICATION_TYPES.INFO:
      default:
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return (
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case NOTIFICATION_TYPES.ERROR:
        return (
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case NOTIFICATION_TYPES.WARNING:
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case NOTIFICATION_TYPES.INFO:
      default:
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={`
        w-full max-w-sm mx-auto mb-4 p-4 rounded-lg transition-all duration-300 cursor-pointer
        ${getTypeStyles()}
        ${isVisible && !isRemoving ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'}
        ${isRemoving ? 'transform scale-95 opacity-0' : ''}
        hover:shadow-xl
      `}
      onClick={handleRemove}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          {notification.title && (
            <h4 className="text-sm font-medium mb-1 truncate">
              {notification.title}
            </h4>
          )}

          <p className="text-sm leading-relaxed">
            {notification.message}
          </p>

          {notification.details && (
            <details className="mt-2">
              <summary className="text-xs opacity-75 cursor-pointer hover:opacity-100">
                Dettagli
              </summary>
              <pre className="text-xs mt-1 bg-black bg-opacity-10 p-2 rounded overflow-auto max-h-32">
                {notification.details}
              </pre>
            </details>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs opacity-60">
              {formatTimestamp(notification.timestamp)}
            </span>

            {notification.action && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  notification.action.onClick();
                  handleRemove();
                }}
                className="text-xs font-medium underline hover:no-underline focus:outline-none"
              >
                {notification.action.label}
              </button>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="flex-shrink-0 ml-3 p-1 rounded-md hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current transition-colors"
          aria-label="Chiudi notifica"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {notification.autoHide && config.autoHideDuration > 0 && (
        <div className="mt-2">
          <div
            className="h-1 bg-current opacity-30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-current rounded-full animate-pulse"
              style={{
                animation: `shrink ${config.autoHideDuration}ms linear forwards`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Toast;