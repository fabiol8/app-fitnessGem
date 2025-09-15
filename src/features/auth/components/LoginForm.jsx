import React, { useState } from 'react';
import { Button, Input } from '../../../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useAuthValidation } from '../hooks/useAuthValidation';
import AuthLayout from './AuthLayout';

const LoginForm = ({ onSwitchToRegister, onSwitchToForgotPassword }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const { signIn, loading, error, clearError } = useAuth();
  const {
    validationErrors,
    validateLoginForm,
    clearFieldError
  } = useAuthValidation();

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
    if (!validateLoginForm(formData)) {
      return;
    }

    // Attempt login
    const result = await signIn(formData.email, formData.password);

    if (result.error) {
      console.error('Login failed:', result.error);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google login
    console.log('Google login not implemented yet');
  };

  return (
    <AuthLayout
      title="Benvenuto!"
      subtitle="Accedi al tuo account per continuare"
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

        {/* Password */}
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="La tua password"
          error={validationErrors.password}
          required
          autoComplete="current-password"
          icon="🔒"
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Ricordami</span>
          </label>

          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Password dimenticata?
          </button>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
        >
          {loading ? 'Accesso in corso...' : 'Accedi'}
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">oppure</span>
          </div>
        </div>

        {/* Google Login */}
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full border border-gray-300"
          onClick={handleGoogleLogin}
        >
          <div className="flex items-center justify-center space-x-2">
            <span>🔗</span>
            <span>Continua con Google</span>
          </div>
        </Button>

        {/* Switch to Register */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            Non hai ancora un account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Registrati
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginForm;