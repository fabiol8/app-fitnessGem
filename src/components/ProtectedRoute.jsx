import React from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';

const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireOnboarding = true,
  fallback = null
}) => {
  const {
    user,
    userProfile,
    loading,
    isAuthenticated,
    hasCompletedOnboarding
  } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">💪</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Caricamento...
          </h2>
          <p className="text-gray-600">
            Verifica autenticazione in corso
          </p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-600">🔒</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Accesso Richiesto
          </h2>
          <p className="text-gray-600">
            Devi effettuare l'accesso per visualizzare questa pagina
          </p>
        </div>
      </div>
    );
  }

  // Check onboarding requirement
  if (requireAuth && requireOnboarding && isAuthenticated && !hasCompletedOnboarding) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-yellow-600">⚙️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Configurazione Richiesta
          </h2>
          <p className="text-gray-600">
            Completa la configurazione del profilo per continuare
          </p>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return children;
};

export default ProtectedRoute;