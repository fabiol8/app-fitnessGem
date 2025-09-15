import React, { useState } from 'react';
import { Button, Input, ProgressBar } from '../../../components/ui';
import { useAuthValidation } from '../../auth/hooks/useAuthValidation';
import AuthLayout from '../../auth/components/AuthLayout';

const ProfileSetup = ({ user, goalData, onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    height: '',
    currentWeight: '',
    targetWeight: '',
    activityLevel: 'moderate',
    experience: 'beginner',
    workoutDays: '3',
    dailyCalories: '',
    notifications: true,
    units: 'metric'
  });

  const {
    validationErrors,
    validateProfileForm,
    clearFieldError
  } = useAuthValidation();

  const activityLevels = [
    {
      value: 'sedentary',
      title: 'Sedentario',
      description: 'Poco o nessun esercizio',
      multiplier: 1.2
    },
    {
      value: 'light',
      title: 'Leggera',
      description: 'Esercizio leggero 1-3 giorni/settimana',
      multiplier: 1.375
    },
    {
      value: 'moderate',
      title: 'Moderata',
      description: 'Esercizio moderato 3-5 giorni/settimana',
      multiplier: 1.55
    },
    {
      value: 'active',
      title: 'Attiva',
      description: 'Esercizio intenso 6-7 giorni/settimana',
      multiplier: 1.725
    },
    {
      value: 'very_active',
      title: 'Molto Attiva',
      description: 'Esercizio molto intenso, 2x al giorno',
      multiplier: 1.9
    }
  ];

  const experienceLevels = [
    {
      value: 'beginner',
      title: 'Principiante',
      description: 'Nuovo al fitness o poco esperto',
      icon: '🌱'
    },
    {
      value: 'intermediate',
      title: 'Intermedio',
      description: 'Qualche esperienza con allenamenti',
      icon: '🌿'
    },
    {
      value: 'advanced',
      title: 'Avanzato',
      description: 'Esperto di fitness e allenamento',
      icon: '🌳'
    }
  ];

  const calculateBMR = () => {
    const { height, currentWeight } = formData;
    const age = user?.age || 25;

    if (!height || !currentWeight) return 0;

    // Mifflin-St Jeor Equation (assuming average male/female)
    const bmr = (10 * parseFloat(currentWeight)) +
                (6.25 * parseFloat(height)) -
                (5 * age) + 5; // +5 for male, -161 for female (using neutral)

    return Math.round(bmr);
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const activityLevel = activityLevels.find(level => level.value === formData.activityLevel);
    return Math.round(bmr * (activityLevel?.multiplier || 1.55));
  };

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

    // Auto-calculate daily calories
    if (name === 'height' || name === 'currentWeight' || name === 'activityLevel') {
      setTimeout(() => {
        const tdee = calculateTDEE();
        if (tdee > 0) {
          setFormData(prev => ({
            ...prev,
            dailyCalories: tdee.toString()
          }));
        }
      }, 100);
    }
  };

  const handleComplete = () => {
    // Validate form
    if (!validateProfileForm(formData)) {
      return;
    }

    const profileData = {
      ...formData,
      height: parseFloat(formData.height),
      currentWeight: parseFloat(formData.currentWeight),
      targetWeight: parseFloat(formData.targetWeight),
      dailyCalories: parseInt(formData.dailyCalories),
      workoutDays: parseInt(formData.workoutDays),
      bmr: calculateBMR(),
      tdee: calculateTDEE(),
      goals: goalData?.selectedGoals || [],
      primaryGoal: goalData?.primaryGoal || '',
      onboardingCompleted: true,
      profileCompletedAt: new Date()
    };

    onComplete(profileData);
  };

  const progress = 100; // Step 3 of 3

  return (
    <AuthLayout
      title="Profilo fitness"
      subtitle="Aiutaci a personalizzare la tua esperienza"
      showLogo={false}
    >
      <div className="space-y-6">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Passo 3 di 3</span>
            <span>{progress}% completato</span>
          </div>
          <ProgressBar value={progress} variant="success" size="sm" />
        </div>

        {/* Physical Data */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Dati Fisici</h3>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Altezza"
              type="number"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              placeholder="175"
              error={validationErrors.height}
              required
              unit="cm"
              min="100"
              max="250"
            />

            <Input
              label="Peso Attuale"
              type="number"
              name="currentWeight"
              value={formData.currentWeight}
              onChange={handleInputChange}
              placeholder="70"
              error={validationErrors.currentWeight}
              required
              unit="kg"
              min="30"
              max="300"
              step="0.1"
            />
          </div>

          <Input
            label="Peso Obiettivo"
            type="number"
            name="targetWeight"
            value={formData.targetWeight}
            onChange={handleInputChange}
            placeholder="65"
            error={validationErrors.targetWeight}
            required
            unit="kg"
            min="30"
            max="300"
            step="0.1"
          />
        </div>

        {/* Activity Level */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Livello di Attività</h3>
          <div className="space-y-2">
            {activityLevels.map((level) => (
              <label
                key={level.value}
                className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  formData.activityLevel === level.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="activityLevel"
                  value={level.value}
                  checked={formData.activityLevel === level.value}
                  onChange={handleInputChange}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    {level.title}
                  </div>
                  <div className="text-gray-600 text-xs">
                    {level.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Esperienza Fitness</h3>
          <div className="grid grid-cols-3 gap-2">
            {experienceLevels.map((level) => (
              <label
                key={level.value}
                className={`p-3 rounded-lg border cursor-pointer transition-colors text-center ${
                  formData.experience === level.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="experience"
                  value={level.value}
                  checked={formData.experience === level.value}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="text-2xl mb-2">{level.icon}</div>
                <div className="font-medium text-gray-900 text-sm">
                  {level.title}
                </div>
                <div className="text-gray-600 text-xs">
                  {level.description}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Workout Frequency */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Giorni allenamento/settimana"
            type="number"
            name="workoutDays"
            value={formData.workoutDays}
            onChange={handleInputChange}
            min="1"
            max="7"
            required
          />

          <Input
            label="Calorie giornaliere target"
            type="number"
            name="dailyCalories"
            value={formData.dailyCalories}
            onChange={handleInputChange}
            unit="kcal"
            min="1200"
            max="4000"
            required
          />
        </div>

        {/* Calculated Values */}
        {formData.height && formData.currentWeight && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 text-sm mb-2">
              Valori Calcolati
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-700">BMR (metabolismo base):</span>
                <span className="font-medium text-blue-900 ml-1">
                  {calculateBMR()} kcal/giorno
                </span>
              </div>
              <div>
                <span className="text-blue-700">TDEE (fabbisogno totale):</span>
                <span className="font-medium text-blue-900 ml-1">
                  {calculateTDEE()} kcal/giorno
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Preferences */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Preferenze</h3>

          <label className="flex items-center justify-between">
            <span className="text-gray-700 text-sm">
              Ricevi notifiche e promemoria
            </span>
            <input
              type="checkbox"
              name="notifications"
              checked={formData.notifications}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={onBack}
          >
            ← Indietro
          </Button>
          <Button
            variant="success"
            size="lg"
            className="flex-1"
            onClick={handleComplete}
          >
            Completa Setup ✨
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ProfileSetup;