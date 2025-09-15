import React from 'react';
import { Button, Card } from '../../../components/ui';
import AuthLayout from '../../auth/components/AuthLayout';

const WelcomeScreen = ({ user, onContinue }) => {
  const benefits = [
    {
      icon: '🎯',
      title: 'Obiettivi Personalizzati',
      description: 'Imposta e raggiungi i tuoi traguardi fitness con piani su misura'
    },
    {
      icon: '📊',
      title: 'Tracking Completo',
      description: 'Monitora progressi, allenamenti, nutrizione e benessere mentale'
    },
    {
      icon: '🧘',
      title: 'Mindfulness Integrata',
      description: 'Meditazione e tecniche di respirazione per il benessere totale'
    },
    {
      icon: '💪',
      title: 'Motivazione Costante',
      description: 'Notifiche smart e promemoria per mantenerti sempre attivo'
    }
  ];

  return (
    <AuthLayout
      title={`Ciao ${user?.displayName || 'Benvenuto'}! 👋`}
      subtitle="Sei pronto a trasformare il tuo stile di vita?"
      showLogo={false}
    >
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <p className="text-gray-600">
            Benvenuto in FitnessApp! Siamo entusiasti di accompagnarti nel tuo
            percorso verso una vita più sana e equilibrata.
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 text-center mb-4">
            Cosa puoi fare con FitnessApp:
          </h3>
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg border border-white/20"
            >
              <span className="text-2xl flex-shrink-0">{benefit.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">
                  {benefit.title}
                </h4>
                <p className="text-gray-600 text-xs">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy Note */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <span className="text-green-600 text-lg">🔒</span>
            <div className="text-sm text-green-700">
              <p className="font-medium mb-1">Privacy e Sicurezza</p>
              <p>
                I tuoi dati sono crittografati e sincronizzati in modo sicuro.
                Solo tu hai accesso alle tue informazioni personali.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Setup Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 text-lg">⚡</span>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Setup Veloce</p>
              <p>
                Ti serve solo un minuto per configurare il tuo profilo.
                Potrai sempre modificare le impostazioni in seguito.
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onContinue}
        >
          Inizia la configurazione →
        </Button>

        {/* Skip Option */}
        <div className="text-center">
          <button
            onClick={() => onContinue(true)} // Skip parameter
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Salta per ora (sconsigliato)
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default WelcomeScreen;