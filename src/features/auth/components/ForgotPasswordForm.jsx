import React, { useState } from 'react';
import { Button, Input } from '../../../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useAuthValidation } from '../hooks/useAuthValidation';
import AuthLayout from './AuthLayout';

const ForgotPasswordForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [emailSent, setEmailSent] = useState(false);

  const { resetPassword, loading, error, clearError } = useAuth();
  const {
    validationErrors,
    validateResetPasswordForm,
    clearFieldError
  } = useAuthValidation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (validationErrors[name]) {
      clearFieldError(name);
    }

    // Clear auth error when user modifies form
    if (error) {
      clearError();
    }

    // Reset email sent state when email changes
    if (emailSent) {
      setEmailSent(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateResetPasswordForm(formData)) {
      return;
    }

    // Attempt password reset
    const result = await resetPassword(formData.email);

    if (!result.error) {
      setEmailSent(true);
    }
  };

  const handleResendEmail = async () => {
    const result = await resetPassword(formData.email);
    if (!result.error) {
      // Reset timer or show confirmation
      console.log('Email resent successfully');
    }
  };

  if (emailSent) {
    return (
      <AuthLayout
        title="Email inviata!"
        subtitle="Controlla la tua casella di posta"
      >
        <div className="text-center space-y-4">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📧</span>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <p className="text-gray-700">
              Abbiamo inviato le istruzioni per reimpostare la password a:
            </p>
            <p className="font-medium text-gray-900">{formData.email}</p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h4 className="font-medium text-blue-900 mb-2">Prossimi passi:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Controlla la tua casella di posta elettronica</li>
              <li>2. Clicca sul link nell'email ricevuta</li>
              <li>3. Imposta una nuova password</li>
              <li>4. Torna qui per accedere</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={onSwitchToLogin}
            >
              Torna al login
            </Button>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Non hai ricevuto l'email?{' '}
                <button
                  type="button"
                  onClick={handleResendEmail}
                  className="text-blue-600 hover:text-blue-700 underline"
                  disabled={loading}
                >
                  Invia di nuovo
                </button>
              </p>
            </div>
          </div>

          {/* Help */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Controlla anche la cartella spam. Se continui ad avere problemi,{' '}
              <button className="underline hover:text-gray-700">
                contattaci
              </button>
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Password dimenticata?"
      subtitle="Inserisci la tua email per ricevere le istruzioni"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Global Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">⚠️</span>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 text-lg">💡</span>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Come funziona:</p>
              <p>
                Inserisci l'email del tuo account. Ti invieremo un link sicuro
                per creare una nuova password.
              </p>
            </div>
          </div>
        </div>

        {/* Email */}
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="la-tua-email@esempio.com"
          error={validationErrors.email}
          required
          autoComplete="email"
          icon="📧"
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
        >
          {loading ? 'Invio in corso...' : 'Invia istruzioni'}
        </Button>

        {/* Back to Login */}
        <div className="text-center pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-gray-600 hover:text-gray-700 text-sm flex items-center justify-center space-x-1"
          >
            <span>←</span>
            <span>Torna al login</span>
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordForm;