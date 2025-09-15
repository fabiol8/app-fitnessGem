import React, { useState, useEffect } from 'react';
import AuthGuard from './components/AuthGuard';
import AuthenticatedApp from './AuthenticatedApp';
import SplashScreen from './components/SplashScreen';

const MultiUserApp = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize any global app settings here
    const initializeApp = async () => {
      try {
        // Simulate app initialization
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if we need to show splash screen
        const hasSeenSplash = localStorage.getItem('fitness_app_splash_seen');

        if (hasSeenSplash) {
          setShowSplash(false);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsInitialized(true);
        setShowSplash(false);
      }
    };

    initializeApp();
  }, []);

  const handleSplashComplete = () => {
    localStorage.setItem('fitness_app_splash_seen', 'true');
    setShowSplash(false);
  };

  // Show splash screen on first load
  if (showSplash && isInitialized) {
    return (
      <SplashScreen
        onComplete={handleSplashComplete}
        minDuration={2500}
      />
    );
  }

  // Show app loading state
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">💪</span>
          </div>
          <p className="text-gray-600">Inizializzazione app...</p>
        </div>
      </div>
    );
  }

  // Main app with authentication guard
  return (
    <AuthGuard>
      <AuthenticatedApp />
    </AuthGuard>
  );
};

export default MultiUserApp;