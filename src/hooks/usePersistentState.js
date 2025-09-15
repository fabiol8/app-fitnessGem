import { useState, useEffect, useCallback } from 'react';

export const usePersistentState = (key, defaultValue, options = {}) => {
  const {
    storage = localStorage,
    serializer = JSON,
    syncAcrossTabs = false
  } = options;

  const [state, setState] = useState(() => {
    try {
      const item = storage.getItem(key);
      return item ? serializer.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading ${key} from storage:`, error);
      return defaultValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value;
      setState(valueToStore);

      if (valueToStore === undefined || valueToStore === null) {
        storage.removeItem(key);
      } else {
        // Clean the value to prevent circular references
        const cleanValue = JSON.parse(JSON.stringify(valueToStore, (key, val) => {
          if (val != null && typeof val === "object") {
            if (val.constructor && val.constructor.name && val.constructor.name.includes('Element')) {
              return '[DOM Element]';
            }
            if (val.__reactFiber$ || val._reactInternalFiber) {
              return '[React Fiber]';
            }
          }
          return val;
        }));
        storage.setItem(key, serializer.stringify(cleanValue));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Error setting ${key} in storage:`, error);
      }
    }
  }, [key, state, storage, serializer]);

  const removeValue = useCallback(() => {
    try {
      storage.removeItem(key);
      setState(defaultValue);
    } catch (error) {
      console.warn(`Error removing ${key} from storage:`, error);
    }
  }, [key, defaultValue, storage]);

  // Sync across tabs
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setState(serializer.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing storage change for ${key}:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, serializer, syncAcrossTabs]);

  return [state, setValue, removeValue];
};

export default usePersistentState;