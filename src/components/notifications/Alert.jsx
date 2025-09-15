import React from 'react';
import { NOTIFICATION_TYPES } from '../../contexts/NotificationContext';

const Alert = ({
  type = NOTIFICATION_TYPES.INFO,
  title,
  message,
  onClose,
  actions = [],
  className = "",
  icon,
  dismissible = true
}) => {
  const getTypeStyles = () => {
    const baseStyles = "border rounded-lg p-4";

    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case NOTIFICATION_TYPES.ERROR:
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      case NOTIFICATION_TYPES.WARNING:
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case NOTIFICATION_TYPES.INFO:
      default:
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
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

  const getActionButtonStyles = (actionType = 'secondary') => {
    const baseStyles = "px-3 py-1 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return actionType === 'primary'
          ? `${baseStyles} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`
          : `${baseStyles} bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500`;
      case NOTIFICATION_TYPES.ERROR:
        return actionType === 'primary'
          ? `${baseStyles} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`
          : `${baseStyles} bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500`;
      case NOTIFICATION_TYPES.WARNING:
        return actionType === 'primary'
          ? `${baseStyles} bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500`
          : `${baseStyles} bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-500`;
      case NOTIFICATION_TYPES.INFO:
      default:
        return actionType === 'primary'
          ? `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`
          : `${baseStyles} bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-500`;
    }
  };

  return (
    <div className={`${getTypeStyles()} ${className}`} role="alert">
      <div className="flex">
        {(icon !== null) && (
          <div className="flex-shrink-0 mr-3">
            {icon || getDefaultIcon()}
          </div>
        )}

        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}

          {message && (
            <div className="text-sm">
              {typeof message === 'string' ? (
                <p>{message}</p>
              ) : (
                message
              )}
            </div>
          )}

          {actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={getActionButtonStyles(action.type)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {dismissible && onClose && (
          <div className="flex-shrink-0 ml-3">
            <button
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current hover:bg-black hover:bg-opacity-10 transition-colors"
              aria-label="Chiudi alert"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;