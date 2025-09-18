import { useState, useEffect, useCallback, useRef } from 'react';
import { secureSerializer, sanitizeForStorage, isEncryptionSupported } from '../utils/encryption';

export const usePersistentState = (key, defaultValue, options = {}) => {
  const {
    storage = localStorage,
    serializer = JSON,
    syncAcrossTabs = false,
    enableEncryption = true,
    isSensitiveData = false,
  } = options;

  const shouldEncrypt = enableEncryption && isEncryptionSupported() && isSensitiveData;

  const defaultValueRef = useRef(defaultValue);
  const [state, setState] = useState(defaultValueRef.current);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    defaultValueRef.current = defaultValue;
  }, [defaultValue]);

  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const item = storage.getItem(key);
        if (!item) {
          setIsLoading(false);
          return;
        }

        if (shouldEncrypt) {
          const decryptedData = await secureSerializer.parse(item);
          setState(decryptedData);
        } else {
          setState(serializer.parse(item));
        }
      } catch (error) {
        console.warn(`Error reading ${key} from storage:`, error);
        setState(defaultValueRef.current);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialState();
  }, [key, shouldEncrypt, storage, serializer]);

  const setValue = useCallback(
    async value => {
      try {
        const valueToStore = value instanceof Function ? value(state) : value;
        const sanitizedValue = isSensitiveData ? sanitizeForStorage(valueToStore) : valueToStore;

        setState(sanitizedValue);

        if (sanitizedValue === undefined || sanitizedValue === null) {
          storage.removeItem(key);
        } else {
          let serializedValue;
          if (shouldEncrypt) {
            serializedValue = await secureSerializer.stringify(sanitizedValue);
          } else {
            const cleanValue = JSON.parse(
              JSON.stringify(sanitizedValue, (objKey, val) => {
                if (val != null && typeof val === 'object') {
                  if (val.constructor && val.constructor.name && val.constructor.name.includes('Element')) {
                    return '[DOM Element]';
                  }
                  if (val.__reactFiber$ || val._reactInternalFiber) {
                    return '[React Fiber]';
                  }
                }
                return val;
              })
            );
            serializedValue = serializer.stringify(cleanValue);
          }

          storage.setItem(key, serializedValue);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Error setting ${key} in storage:`, error);
        }
      }
    },
    [key, state, storage, serializer, shouldEncrypt, isSensitiveData]
  );

  const removeValue = useCallback(() => {
    try {
      storage.removeItem(key);
      setState(defaultValueRef.current);
    } catch (error) {
      console.warn(`Error removing ${key} from storage:`, error);
    }
  }, [key, storage]);

  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = async event => {
      if (event.key === key && event.newValue !== null) {
        try {
          if (shouldEncrypt) {
            const decryptedData = await secureSerializer.parse(event.newValue);
            setState(decryptedData);
          } else {
            setState(serializer.parse(event.newValue));
          }
        } catch (error) {
          console.warn(`Error parsing storage change for ${key}:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, serializer, syncAcrossTabs, shouldEncrypt]);

  return [state, setValue, removeValue, { isLoading, isEncrypted: shouldEncrypt }];
};

export default usePersistentState;
