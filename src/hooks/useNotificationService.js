import { useNotifications } from '../contexts/NotificationContext';
import { useCallback } from 'react';

/**
 * Enhanced notification service hook with smart error handling
 * and user-friendly message formatting
 */
export const useNotificationService = () => {
  const notifications = useNotifications();

  // Error handlers with smart formatting
  const handleError = useCallback((error, context = '', options = {}) => {
    let message = 'Si è verificato un errore';
    let details = null;
    let title = 'Errore';

    // Format different error types
    if (error instanceof Error) {
      message = error.message;
      details = error.stack;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error?.message) {
      message = error.message;
      details = error.details || JSON.stringify(error, null, 2);
    }

    // Add context if provided
    if (context) {
      title = `Errore ${context}`;
    }

    // Show user-friendly messages for common errors
    const userFriendlyMessages = {
      'Network Error': 'Problema di connessione. Verifica la tua connessione internet.',
      'Failed to fetch': 'Impossibile contattare il server. Riprova più tardi.',
      'Firebase: Error': 'Problema con il servizio cloud. Riprova più tardi.',
      'Permission denied': 'Non hai i permessi necessari per questa operazione.',
      'Not found': 'Risorsa non trovata.',
      'Timeout': 'Operazione scaduta. Riprova.',
      'Unauthorized': 'Accesso non autorizzato. Effettua il login.'
    };

    // Check for user-friendly alternatives
    for (const [key, friendlyMessage] of Object.entries(userFriendlyMessages)) {
      if (message.includes(key)) {
        message = friendlyMessage;
        break;
      }
    }

    notifications.error(message, {
      title,
      details: process.env.NODE_ENV === 'development' ? details : null,
      ...options
    });
  }, [notifications]);

  // Success with context awareness
  const handleSuccess = useCallback((message, context = '', options = {}) => {
    const contextMessages = {
      save: '💾 Dati salvati con successo',
      delete: '🗑️ Eliminato con successo',
      update: '✏️ Aggiornato con successo',
      sync: '🔄 Sincronizzazione completata',
      upload: '📤 Caricamento completato',
      download: '📥 Download completato',
      login: '👋 Accesso effettuato',
      logout: '👋 Disconnessione effettuata'
    };

    const finalMessage = context && contextMessages[context]
      ? contextMessages[context]
      : message;

    notifications.success(finalMessage, options);
  }, [notifications]);

  // Warning with smart categorization
  const handleWarning = useCallback((message, category = '', options = {}) => {
    const categoryPrefixes = {
      validation: '⚠️ Attenzione: ',
      performance: '🐌 Performance: ',
      security: '🔒 Sicurezza: ',
      compatibility: '🔧 Compatibilità: ',
      storage: '💾 Spazio: '
    };

    const prefix = categoryPrefixes[category] || '⚠️ ';

    notifications.warning(`${prefix}${message}`, {
      title: category ? `Avviso ${category}` : 'Avviso',
      ...options
    });
  }, [notifications]);

  // Info with smart formatting
  const handleInfo = useCallback((message, context = '', options = {}) => {
    const contextIcons = {
      tip: '💡',
      update: '🔄',
      new: '✨',
      help: '❓',
      sync: '☁️',
      offline: '📴',
      online: '🌐'
    };

    const icon = contextIcons[context] || 'ℹ️';

    notifications.info(`${icon} ${message}`, options);
  }, [notifications]);

  // Network status notifications
  const handleNetworkError = useCallback((retryAction = null) => {
    const options = retryAction ? {
      action: {
        label: 'Riprova',
        onClick: retryAction
      }
    } : {};

    handleError('Connessione non disponibile. Verifica la tua connessione internet.', 'di rete', {
      autoHide: false,
      ...options
    });
  }, [handleError]);

  // Form validation notifications
  const handleValidationError = useCallback((fieldErrors = {}) => {
    const errorCount = Object.keys(fieldErrors).length;

    if (errorCount === 1) {
      const [field, error] = Object.entries(fieldErrors)[0];
      handleWarning(`${field}: ${error}`, 'validation');
    } else if (errorCount > 1) {
      handleWarning(
        `Correggi ${errorCount} campi nel modulo`,
        'validation',
        {
          details: Object.entries(fieldErrors)
            .map(([field, error]) => `${field}: ${error}`)
            .join('\n')
        }
      );
    }
  }, [handleWarning]);

  // Loading state notifications
  const handleLoading = useCallback((message, id = 'loading') => {
    notifications.info(`⏳ ${message}`, {
      id,
      autoHide: false,
      persistent: true
    });

    return () => notifications.removeNotification(id);
  }, [notifications]);

  // Batch operations
  const handleBatchOperation = useCallback((results, operation = 'operazione') => {
    const { success = [], errors = [] } = results;

    if (errors.length === 0) {
      handleSuccess(`${operation} completata per ${success.length} elementi`);
    } else if (success.length === 0) {
      handleError(`${operation} fallita per tutti gli elementi (${errors.length})`);
    } else {
      handleWarning(
        `${operation} parzialmente completata: ${success.length} successi, ${errors.length} errori`,
        'batch',
        {
          details: errors.length > 0 ? `Errori:\n${errors.join('\n')}` : null
        }
      );
    }
  }, [handleSuccess, handleError, handleWarning]);

  // Offline/Online status
  const handleOfflineMode = useCallback((isOffline) => {
    if (isOffline) {
      handleInfo('Modalità offline attivata. I dati verranno sincronizzati quando tornerai online.', 'offline', {
        autoHide: false
      });
    } else {
      handleInfo('Connessione ripristinata. Sincronizzazione in corso...', 'online');
    }
  }, [handleInfo]);

  return {
    // Core methods
    ...notifications,

    // Enhanced methods
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,

    // Specialized methods
    handleNetworkError,
    handleValidationError,
    handleLoading,
    handleBatchOperation,
    handleOfflineMode,

    // Shortcuts
    showError: handleError,
    showSuccess: handleSuccess,
    showWarning: handleWarning,
    showInfo: handleInfo
  };
};

export default useNotificationService;