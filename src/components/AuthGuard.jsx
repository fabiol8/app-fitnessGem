import React, { useState } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';
import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';
import ForgotPasswordForm from '../features/auth/components/ForgotPasswordForm';
import OnboardingFlow from '../features/onboarding/components/OnboardingFlow';

const AuthGuard = ({ children }) => {
  const [authState, setAuthState] = useState('login'); // login, register, forgot-password
  const {
    user,
    userProfile,
    loading,
    isAuthenticated,
    hasCompletedOnboarding
  } = useAuth();

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-3xl">💪</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">FitnessApp</h1>
          <p className="text-gray-600">Caricamento in corso...</p>
        </div>
      </div>
    );
  }

  // User not authenticated - show auth forms
  if (!isAuthenticated) {
    switch (authState) {
      case 'register':
        return (
          <RegisterForm
            onSwitchToLogin={() => setAuthState('login')}
            onRegistrationSuccess={() => {
              // After successful registration, user will be auto-logged in
              // and will see onboarding flow
            }}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onSwitchToLogin={() => setAuthState('login')}
          />
        );

      case 'login':
      default:
        return (
          <LoginForm
            onSwitchToRegister={() => setAuthState('register')}
            onSwitchToForgotPassword={() => setAuthState('forgot-password')}
          />
        );
    }
  }

  // User authenticated but needs onboarding
  if (!hasCompletedOnboarding) {
    return (
      <OnboardingFlow
        onComplete={(profileData) => {
          console.log('Onboarding completed:', profileData);
          // The user profile will be automatically updated
          // and hasCompletedOnboarding will become true
        }}
      />
    );
  }

  // User authenticated and onboarded - show protected content
  return (
    <ProtectedRoute
      requireAuth={true}
      requireOnboarding={true}
    >
      {children}
    </ProtectedRoute>
  );
};

export default AuthGuard;