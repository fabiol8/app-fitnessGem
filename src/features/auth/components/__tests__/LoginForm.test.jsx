import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LoginForm from '../LoginForm';

const signInMock = vi.fn();
const clearErrorMock = vi.fn();
const validateLoginFormMock = vi.fn();
const clearFieldErrorMock = vi.fn();

let mockValidationErrors = {};
let mockAuthError = null;

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: signInMock,
    loading: false,
    error: mockAuthError,
    clearError: clearErrorMock
  })
}));

vi.mock('../../hooks/useAuthValidation', () => ({
  useAuthValidation: () => ({
    validationErrors: mockValidationErrors,
    validateLoginForm: validateLoginFormMock,
    clearFieldError: clearFieldErrorMock
  })
}));

describe('LoginForm', () => {
  beforeEach(() => {
    signInMock.mockReset();
    clearErrorMock.mockReset();
    validateLoginFormMock.mockReset();
    clearFieldErrorMock.mockReset();
    mockValidationErrors = {};
    mockAuthError = null;
  });

  const setup = () => {
    render(
      <LoginForm
        onSwitchToRegister={vi.fn()}
        onSwitchToForgotPassword={vi.fn()}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /accedi/i });

    return { emailInput, passwordInput, submitButton };
  };

  it('submits credentials when validation passes', async () => {
    validateLoginFormMock.mockReturnValue(true);
    signInMock.mockResolvedValue({ user: { uid: 'demo' } });

    const { emailInput, passwordInput, submitButton } = setup();

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'TestPass123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(validateLoginFormMock).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'TestPass123!',
        rememberMe: false
      });
      expect(signInMock).toHaveBeenCalledWith('user@example.com', 'TestPass123!');
    });
  });

  it('prevents submission when validation fails', async () => {
    validateLoginFormMock.mockReturnValue(false);

    const { emailInput, passwordInput, submitButton } = setup();

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'TestPass123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(validateLoginFormMock).toHaveBeenCalled();
      expect(signInMock).not.toHaveBeenCalled();
    });
  });

  it('clears field and auth errors while typing', () => {
    mockValidationErrors = { email: 'Email richiesta' };
    mockAuthError = 'Credenziali non valide';
    validateLoginFormMock.mockReturnValue(true);

    const { emailInput } = setup();

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

    expect(clearFieldErrorMock).toHaveBeenCalledWith('email');
    expect(clearErrorMock).toHaveBeenCalled();
  });
});
