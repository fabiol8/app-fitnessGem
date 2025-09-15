import React from 'react';
import { Card } from '../../../components/ui';

const AuthLayout = ({
  children,
  title,
  subtitle,
  showLogo = true,
  className = ''
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
          <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
        </div>
      </div>

      <div className={`w-full max-w-md ${className}`}>
        {/* Logo */}
        {showLogo && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <span className="text-2xl font-bold text-white">💪</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">FitnessApp</h1>
            <p className="text-gray-500 text-sm">Il tuo compagno di benessere</p>
          </div>
        )}

        {/* Auth Card */}
        <Card glass padding="lg" className="shadow-2xl">
          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center mb-6">
              {title && (
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-gray-600 text-sm">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          {children}
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>
            Continuando accetti i nostri{' '}
            <button className="underline hover:text-gray-700">
              Termini di Servizio
            </button>{' '}
            e la{' '}
            <button className="underline hover:text-gray-700">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;