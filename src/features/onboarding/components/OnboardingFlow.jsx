import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import WelcomeScreen from './WelcomeScreen';
import GoalSelection from './GoalSelection';
import ProfileSetup from './ProfileSetup';

const OnboardingFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [goalData, setGoalData] = useState(null);
  const { user, updateProfile, loading } = useAuth();

  const handleWelcomeContinue = (skip = false) => {
    if (skip) {
      // Skip onboarding - set minimal data and complete
      handleOnboardingComplete({
        goals: ['healthy_habits'],
        primaryGoal: 'healthy_habits',
        onboardingCompleted: true,
        onboardingSkipped: true
      });
    } else {
      setCurrentStep('goals');
    }
  };

  const handleGoalsContinue = (goals) => {
    setGoalData(goals);
    setCurrentStep('profile');
  };

  const handleOnboardingComplete = async (profileData) => {
    try {
      // Update user profile with onboarding data
      await updateProfile(profileData);

      // Call completion callback
      onComplete?.(profileData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'goals':
        setCurrentStep('welcome');
        break;
      case 'profile':
        setCurrentStep('goals');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">⚡</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Configurazione in corso...
          </h2>
          <p className="text-gray-600">
            Stiamo preparando la tua esperienza personalizzata
          </p>
        </div>
      </div>
    );
  }

  switch (currentStep) {
    case 'welcome':
      return (
        <WelcomeScreen
          user={user}
          onContinue={handleWelcomeContinue}
        />
      );

    case 'goals':
      return (
        <GoalSelection
          onContinue={handleGoalsContinue}
          onBack={handleBack}
        />
      );

    case 'profile':
      return (
        <ProfileSetup
          user={user}
          goalData={goalData}
          onComplete={handleOnboardingComplete}
          onBack={handleBack}
        />
      );

    default:
      return null;
  }
};

export default OnboardingFlow;