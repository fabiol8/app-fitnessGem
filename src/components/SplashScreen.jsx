import React, { useEffect, useState } from 'react';
import { Card } from './ui';

const SplashScreen = ({ onComplete, minDuration = 2000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, minDuration / 50);

    // Auto complete after minimum duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 500); // Additional time for fade out animation
    }, minDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [minDuration, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      {/* Background Animation */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      {/* Splash Content */}
      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-8 animate-pulse">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-4xl font-bold text-white">💪</span>
          </div>

          {/* App Name */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            FitnessApp
          </h1>
          <p className="text-gray-600 text-lg">
            Il tuo compagno di benessere
          </p>
        </div>

        {/* Features Preview */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <span>🏋️‍♂️</span>
              <span>Allenamenti</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>🍽️</span>
              <span>Nutrizione</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>🧘</span>
              <span>Mindfulness</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gray-500 text-sm">
            {progress < 30 ? 'Inizializzazione...' :
             progress < 60 ? 'Caricamento componenti...' :
             progress < 90 ? 'Connessione ai servizi...' :
             'Quasi pronto!'}
          </p>
        </div>

        {/* Version */}
        <div className="mt-8 text-xs text-gray-400">
          <p>Versione 2.0.0 • Powered by Firebase</p>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75" />
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-ping opacity-50 animation-delay-1000" />
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-60 animation-delay-2000" />
      </div>
    </div>
  );
};

export default SplashScreen;