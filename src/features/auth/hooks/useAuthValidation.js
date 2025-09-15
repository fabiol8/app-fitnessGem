import { useState, useCallback } from 'react';
import { authService } from '../services/authService';

export const useAuthValidation = () => {
  const [validationErrors, setValidationErrors] = useState({});

  const validateEmail = useCallback((email) => {
    if (!email) {
      return 'Email richiesta';
    }

    if (!authService.validateEmail(email)) {
      return 'Formato email non valido';
    }

    return null;
  }, []);

  const validatePassword = useCallback((password) => {
    if (!password) {
      return 'Password richiesta';
    }

    const validation = authService.validatePassword(password);

    if (!validation.isValid) {
      const errors = [];
      if (!validation.checks.minLength) errors.push('almeno 8 caratteri');
      if (!validation.checks.hasUpperCase) errors.push('una lettera maiuscola');
      if (!validation.checks.hasLowerCase) errors.push('una lettera minuscola');
      if (!validation.checks.hasNumbers) errors.push('un numero');

      return `La password deve contenere: ${errors.join(', ')}`;
    }

    return null;
  }, []);

  const validatePasswordConfirmation = useCallback((password, confirmPassword) => {
    if (!confirmPassword) {
      return 'Conferma password richiesta';
    }

    if (password !== confirmPassword) {
      return 'Le password non corrispondono';
    }

    return null;
  }, []);

  const validateName = useCallback((name) => {
    if (!name || name.trim().length === 0) {
      return 'Nome richiesto';
    }

    if (name.trim().length < 2) {
      return 'Il nome deve avere almeno 2 caratteri';
    }

    if (name.length > 50) {
      return 'Il nome non può superare i 50 caratteri';
    }

    return null;
  }, []);

  const validateAge = useCallback((age) => {
    const ageNum = parseInt(age);

    if (!age || isNaN(ageNum)) {
      return 'Età richiesta';
    }

    if (ageNum < 13) {
      return 'Devi avere almeno 13 anni';
    }

    if (ageNum > 120) {
      return 'Età non valida';
    }

    return null;
  }, []);

  const validateHeight = useCallback((height) => {
    const heightNum = parseFloat(height);

    if (!height || isNaN(heightNum)) {
      return 'Altezza richiesta';
    }

    if (heightNum < 100 || heightNum > 250) {
      return 'Altezza deve essere tra 100 e 250 cm';
    }

    return null;
  }, []);

  const validateWeight = useCallback((weight) => {
    const weightNum = parseFloat(weight);

    if (!weight || isNaN(weightNum)) {
      return 'Peso richiesto';
    }

    if (weightNum < 30 || weightNum > 300) {
      return 'Peso deve essere tra 30 e 300 kg';
    }

    return null;
  }, []);

  const validateLoginForm = useCallback((formData) => {
    const errors = {};

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [validateEmail, validatePassword]);

  const validateRegistrationForm = useCallback((formData) => {
    const errors = {};

    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validatePasswordConfirmation(
      formData.password,
      formData.confirmPassword
    );
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    if (formData.age) {
      const ageError = validateAge(formData.age);
      if (ageError) errors.age = ageError;
    }

    // Terms acceptance
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'Devi accettare i termini e condizioni';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [validateName, validateEmail, validatePassword, validatePasswordConfirmation, validateAge]);

  const validateProfileForm = useCallback((formData) => {
    const errors = {};

    if (formData.name !== undefined) {
      const nameError = validateName(formData.name);
      if (nameError) errors.name = nameError;
    }

    if (formData.height !== undefined) {
      const heightError = validateHeight(formData.height);
      if (heightError) errors.height = heightError;
    }

    if (formData.currentWeight !== undefined) {
      const weightError = validateWeight(formData.currentWeight);
      if (weightError) errors.currentWeight = weightError;
    }

    if (formData.targetWeight !== undefined) {
      const targetWeightError = validateWeight(formData.targetWeight);
      if (targetWeightError) errors.targetWeight = targetWeightError;
    }

    // Validate weight relationship
    if (
      formData.currentWeight &&
      formData.targetWeight &&
      !errors.currentWeight &&
      !errors.targetWeight
    ) {
      const current = parseFloat(formData.currentWeight);
      const target = parseFloat(formData.targetWeight);

      if (Math.abs(current - target) < 1) {
        errors.targetWeight = 'Il peso obiettivo deve differire di almeno 1 kg dal peso attuale';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [validateName, validateHeight, validateWeight]);

  const validateResetPasswordForm = useCallback((formData) => {
    const errors = {};

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [validateEmail]);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const getPasswordStrength = useCallback((password) => {
    if (!password) return { strength: 0, label: 'Molto debole', color: 'red' };

    const validation = authService.validatePassword(password);
    let score = 0;

    if (validation.checks.minLength) score += 1;
    if (validation.checks.hasUpperCase) score += 1;
    if (validation.checks.hasLowerCase) score += 1;
    if (validation.checks.hasNumbers) score += 1;
    if (validation.checks.hasSpecialChar) score += 1;

    const strengthLevels = [
      { strength: 0, label: 'Molto debole', color: 'red' },
      { strength: 20, label: 'Debole', color: 'orange' },
      { strength: 40, label: 'Discreta', color: 'yellow' },
      { strength: 60, label: 'Buona', color: 'blue' },
      { strength: 80, label: 'Forte', color: 'green' },
      { strength: 100, label: 'Molto forte', color: 'green' }
    ];

    const strengthValue = (score / 5) * 100;
    const level = strengthLevels.find(level => strengthValue >= level.strength) || strengthLevels[0];

    return {
      ...level,
      strength: strengthValue,
      checks: validation.checks
    };
  }, []);

  return {
    validationErrors,
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
    validateName,
    validateAge,
    validateHeight,
    validateWeight,
    validateLoginForm,
    validateRegistrationForm,
    validateProfileForm,
    validateResetPasswordForm,
    clearValidationErrors,
    clearFieldError,
    getPasswordStrength
  };
};