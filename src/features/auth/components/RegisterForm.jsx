import React, { useState } from 'react';
import { Button, Input, ProgressBar } from '../../../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useAuthValidation } from '../hooks/useAuthValidation';
import AuthLayout from './AuthLayout';

const RegisterForm = ({ onSwitchToLogin, onRegistrationSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    acceptTerms: false
  });

  const { signUp, loading, error, clearError } = useAuth();
  const {
    validationErrors,
    validateRegistrationForm,
    clearFieldError,
    getPasswordStrength
  } = useAuthValidation();

  const passwordStrength = getPasswordStrength(formData.password);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: inputValue
    }));

    // Clear field error when user starts typing
    if (validationErrors[name]) {
      clearFieldError(name);
    }

    // Clear auth error when user modifies form
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateRegistrationForm(formData)) {
      return;
    }

    // Prepare user data
    const userData = {
      name: formData.name.trim(),
      age: parseInt(formData.age),
      onboardingCompleted: false,
      goals: [],
      preferences: {
        units: 'metric',
        notifications: true,
        privacy: 'private'
      }
    };

    // Attempt registration
    const result = await signUp(formData.email, formData.password, userData);

    if (!result.error) {
      onRegistrationSuccess?.(result.user);
    }
  };

  return (
    <AuthLayout
      title="Crea il tuo account"
      subtitle="Inizia il tuo percorso di benessere oggi"
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

        {/* Name */}
        <Input
          label="Nome completo"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Il tuo nome e cognome"
          error={validationErrors.name}
          required
          autoComplete="name"
          icon="👤"
        />

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

        {/* Age */}
        <Input
          label="Età"
          type="number"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
          placeholder="25"
          error={validationErrors.age}
          min="13"
          max="120"
          icon="🎂"
        />

        {/* Password */}
        <div>
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Crea una password sicura"
            error={validationErrors.password}
            required
            autoComplete="new-password"
            icon="🔒"
          />

          {/* Password Strength */}
          {formData.password && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Sicurezza password:</span>
                <span className={`font-medium text-${passwordStrength.color}-600`}>
                  {passwordStrength.label}
                </span>
              </div>
              <ProgressBar
                value={passwordStrength.strength}
                variant={
                  passwordStrength.strength < 40 ? 'danger' :
                  passwordStrength.strength < 80 ? 'warning' : 'success'
                }
                size="sm"
              />

              {/* Password Requirements */}
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className={`flex items-center space-x-1 ${
                  passwordStrength.checks.minLength ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <span>{passwordStrength.checks.minLength ? '✓' : '○'}</span>
                  <span>8+ caratteri</span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  passwordStrength.checks.hasUpperCase ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <span>{passwordStrength.checks.hasUpperCase ? '✓' : '○'}</span>
                  <span>Maiuscola</span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  passwordStrength.checks.hasLowerCase ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <span>{passwordStrength.checks.hasLowerCase ? '✓' : '○'}</span>
                  <span>Minuscola</span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  passwordStrength.checks.hasNumbers ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <span>{passwordStrength.checks.hasNumbers ? '✓' : '○'}</span>
                  <span>Numero</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <Input
          label="Conferma password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Ripeti la password"
          error={validationErrors.confirmPassword}
          required
          autoComplete="new-password"
          icon="🔐"
        />

        {/* Terms Acceptance */}
        <div className="space-y-2">
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleInputChange}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              Accetto i{' '}
              <button type="button" className="text-blue-600 hover:text-blue-700 underline">
                Termini di Servizio
              </button>{' '}
              e la{' '}
              <button type="button" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </button>
            </span>
          </label>
          {validationErrors.acceptTerms && (
            <p className="text-red-600 text-sm">{validationErrors.acceptTerms}</p>
          )}
        </div>

        {/* Register Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          disabled={!formData.acceptTerms}
        >
          {loading ? 'Creazione account...' : 'Crea account'}
        </Button>

        {/* Switch to Login */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            Hai già un account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Accedi
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterForm;