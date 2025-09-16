import React, { useState, useEffect } from 'react';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/notifications/NotificationContainer';
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
        console.log('MultiUserApp: Initializing app...');

        // Simulate app initialization
        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced to 500ms

        // Check if we need to show splash screen
        const hasSeenSplash = localStorage.getItem('fitness_app_splash_seen');
        console.log('MultiUserApp: hasSeenSplash:', hasSeenSplash);

        if (hasSeenSplash) {
          console.log('MultiUserApp: Hiding splash screen');
          setShowSplash(false);
        }

        console.log('MultiUserApp: App initialized');
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

  // Main app with authentication guard and notifications
  return (
    <NotificationProvider config={{ position: 'top-right', autoHideDuration: 5000 }}>
      <AuthGuard>
        <AuthenticatedApp />
      </AuthGuard>
      <NotificationContainer />
    </NotificationProvider>
  );
};

export default MultiUserApp;