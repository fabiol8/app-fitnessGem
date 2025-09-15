import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Notification positions
export const NOTIFICATION_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  TOP_CENTER: 'top-center',
  BOTTOM_CENTER: 'bottom-center'
};

// Default configuration
const DEFAULT_CONFIG = {
  position: NOTIFICATION_POSITIONS.TOP_RIGHT,
  autoHideDuration: 5000,
  maxNotifications: 5,
  enableSounds: false,
  enableAnimations: true
};

// Actions
const ACTIONS = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ALL: 'CLEAR_ALL',
  UPDATE_CONFIG: 'UPDATE_CONFIG'
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_NOTIFICATION: {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        ...action.payload
      };

      // Limit maximum notifications
      const notifications = [notification, ...state.notifications];
      if (notifications.length > state.config.maxNotifications) {
        notifications.splice(state.config.maxNotifications);
      }

      return {
        ...state,
        notifications
      };
    }

    case ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload.id)
      };

    case ACTIONS.CLEAR_ALL:
      return {
        ...state,
        notifications: []
      };

    case ACTIONS.UPDATE_CONFIG:
      return {
        ...state,
        config: { ...state.config, ...action.payload }
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  notifications: [],
  config: DEFAULT_CONFIG
};

// Context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children, config = {} }) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    ...initialState,
    config: { ...DEFAULT_CONFIG, ...config }
  });

  // Add notification
  const addNotification = useCallback((notification) => {
    dispatch({
      type: ACTIONS.ADD_NOTIFICATION,
      payload: {
        type: NOTIFICATION_TYPES.INFO,
        autoHide: true,
        ...notification
      }
    });
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    dispatch({
      type: ACTIONS.REMOVE_NOTIFICATION,
      payload: { id }
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ALL });
  }, []);

  // Update configuration
  const updateConfig = useCallback((newConfig) => {
    dispatch({
      type: ACTIONS.UPDATE_CONFIG,
      payload: newConfig
    });
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      message,
      ...options
    });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      message,
      autoHide: false, // Errors should be manually dismissed
      ...options
    });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      message,
      ...options
    });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.INFO,
      message,
      ...options
    });
  }, [addNotification]);

  // Context value
  const value = {
    notifications: state.notifications,
    config: state.config,
    addNotification,
    removeNotification,
    clearAll,
    updateConfig,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;