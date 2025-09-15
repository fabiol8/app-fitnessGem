import React, { useState } from 'react';
import { useNotificationService } from '../hooks/useNotificationService';
import { NOTIFICATION_TYPES, NOTIFICATION_POSITIONS } from '../contexts/NotificationContext';
import Alert from './notifications/Alert';

const NotificationTestPanel = () => {
  const {
    success,
    error,
    warning,
    info,
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
    handleNetworkError,
    handleValidationError,
    handleLoading,
    clearAll,
    updateConfig,
    config
  } = useNotificationService();

  const [testMessage, setTestMessage] = useState('Questo è un messaggio di test');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState(NOTIFICATION_TYPES.INFO);

  // Test different notification types
  const testNotifications = () => {
    success('Operazione completata con successo! 🎉');

    setTimeout(() => {
      warning('Attenzione: questa è una notifica di avviso ⚠️');
    }, 1000);

    setTimeout(() => {
      info('Informazione utile per l\'utente ℹ️');
    }, 2000);

    setTimeout(() => {
      error('Si è verificato un errore durante l\'operazione ❌');
    }, 3000);
  };

  // Test enhanced methods
  const testEnhancedMethods = () => {
    handleSuccess('Dati salvati', 'save');

    setTimeout(() => {
      handleWarning('Spazio di archiviazione quasi esaurito', 'storage');
    }, 1000);

    setTimeout(() => {
      handleInfo('Nuovo aggiornamento disponibile', 'update');
    }, 2000);

    setTimeout(() => {
      handleError(new Error('Connessione al database fallita'), 'database');
    }, 3000);
  };

  // Test special scenarios
  const testSpecialScenarios = () => {
    // Network error with retry
    handleNetworkError(() => {
      success('Riconnessione riuscita!');
    });

    setTimeout(() => {
      // Validation errors
      handleValidationError({
        'Email': 'Format non valido',
        'Password': 'Troppo corta (minimo 8 caratteri)',
        'Nome': 'Campo obbligatorio'
      });
    }, 1000);

    setTimeout(() => {
      // Loading notification
      const stopLoading = handleLoading('Caricamento dati...');
      setTimeout(() => {
        stopLoading();
        success('Dati caricati con successo!');
      }, 3000);
    }, 2000);
  };

  // Test configuration changes
  const testPositions = () => {
    const positions = Object.values(NOTIFICATION_POSITIONS);
    let index = 0;

    const showNext = () => {
      if (index < positions.length) {
        updateConfig({ position: positions[index] });
        info(`Posizione: ${positions[index]}`, { autoHide: true });
        index++;
        setTimeout(showNext, 1500);
      }
    };

    showNext();
  };

  const testWithActions = () => {
    error('Errore durante il salvataggio', {
      title: 'Errore di salvataggio',
      action: {
        label: 'Riprova',
        onClick: () => success('Salvataggio riuscito dopo il retry!')
      },
      details: 'Stack trace:\nError at line 42\nFunction: saveData()\nFile: api.js'
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🔔 Test Panel Notifiche
      </h2>

      {/* Current Configuration */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Configurazione Attuale:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Posizione:</strong> {config.position}
          </div>
          <div>
            <strong>Auto Hide:</strong> {config.autoHideDuration}ms
          </div>
          <div>
            <strong>Max Notifiche:</strong> {config.maxNotifications}
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={testNotifications}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          🚀 Test Notifiche Base
        </button>

        <button
          onClick={testEnhancedMethods}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          ⭐ Test Metodi Avanzati
        </button>

        <button
          onClick={testSpecialScenarios}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          🎯 Test Scenari Speciali
        </button>

        <button
          onClick={testPositions}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          📍 Test Posizioni
        </button>

        <button
          onClick={testWithActions}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          ⚡ Test con Azioni
        </button>

        <button
          onClick={clearAll}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          🗑️ Pulisci Tutto
        </button>
      </div>

      {/* Custom Message Test */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Test Messaggio Personalizzato:</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Inserisci il tuo messaggio..."
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => success(testMessage)}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
          >
            ✅ Success
          </button>
          <button
            onClick={() => error(testMessage)}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            ❌ Error
          </button>
          <button
            onClick={() => warning(testMessage)}
            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
          >
            ⚠️ Warning
          </button>
          <button
            onClick={() => info(testMessage)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            ℹ️ Info
          </button>
        </div>
      </div>

      {/* Alert Component Test */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Test Alert Component:</h3>

        <div className="flex gap-2 mb-3">
          <select
            value={alertType}
            onChange={(e) => setAlertType(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(NOTIFICATION_TYPES).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <button
            onClick={() => setAlertVisible(!alertVisible)}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            {alertVisible ? 'Nascondi' : 'Mostra'} Alert
          </button>
        </div>

        {alertVisible && (
          <Alert
            type={alertType}
            title={`Alert di tipo ${alertType}`}
            message="Questo è un esempio di alert inline che può essere utilizzato per mostrare messaggi importanti direttamente nel contenuto della pagina."
            onClose={() => setAlertVisible(false)}
            actions={[
              {
                label: 'Azione Primaria',
                type: 'primary',
                onClick: () => success('Azione primaria eseguita!')
              },
              {
                label: 'Azione Secondaria',
                type: 'secondary',
                onClick: () => info('Azione secondaria eseguita!')
              }
            ]}
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="text-center text-sm text-gray-600">
        <p>
          💡 <strong>Suggerimento:</strong> Prova diversi tipi di notifica per vedere come si comportano.
          Le notifiche di errore non si nascondono automaticamente e possono includere azioni.
        </p>
      </div>
    </div>
  );
};

export default NotificationTestPanel;