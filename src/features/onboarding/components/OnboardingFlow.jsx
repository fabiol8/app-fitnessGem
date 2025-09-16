import React, { useState } from 'react';
import { Card, Button, Input } from '../../../components/ui';

const OnboardingFlow = ({ onComplete, user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState({
    age: '',
    weight: '',
    height: '',
    goals: [],
    experience: ''
  });

  const steps = [
    {
      title: 'Benvenuto nell\'App Fitness!',
      subtitle: 'Iniziamo a configurare il tuo profilo personale',
      component: WelcomeStep
    },
    {
      title: 'Informazioni Personali',
      subtitle: 'Aiutaci a conoscerti meglio',
      component: PersonalInfoStep
    },
    {
      title: 'Obiettivi Fitness',
      subtitle: 'Cosa vuoi raggiungere?',
      component: GoalsStep
    },
    {
      title: 'Livello di Esperienza',
      subtitle: 'Qual è il tuo livello attuale?',
      component: ExperienceStep
    },
    {
      title: 'Configurazione Completata',
      subtitle: 'Sei pronto per iniziare!',
      component: CompletionStep
    }
  ];

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Personal Info
        return profile.age && profile.weight && profile.height;
      case 2: // Goals
        return profile.goals && profile.goals.length > 0;
      case 3: // Experience
        return profile.experience;
      default:
        return true;
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep > 0 && currentStep < steps.length - 1 && !validateCurrentStep()) {
      return; // Don't proceed if validation fails
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final validation before completing
      console.log('Final validation check:', profile);

      const missingFields = [];
      if (!profile.age) missingFields.push('età');
      if (!profile.weight) missingFields.push('peso');
      if (!profile.height) missingFields.push('altezza');
      if (!profile.goals?.length) missingFields.push('obiettivi');
      if (!profile.experience) missingFields.push('esperienza');

      if (missingFields.length === 0) {
        console.log('All data valid, completing onboarding...');
        onComplete(profile);
      } else {
        console.warn('Missing fields:', missingFields);
        alert(`Completa questi campi: ${missingFields.join(', ')}`);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateProfile = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Passo {currentStep + 1} di {steps.length}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {steps[currentStep].title}
          </h1>
          <p className="text-gray-600">
            {steps[currentStep].subtitle}
          </p>
        </div>

        {/* Step Content */}
        <CurrentStepComponent
          profile={profile}
          updateProfile={updateProfile}
          user={user}
        />

        {/* Validation Message */}
        {currentStep > 0 && currentStep < steps.length - 1 && !validateCurrentStep() && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-amber-500">⚠️</span>
              <span className="text-amber-700 text-sm">
                {currentStep === 1 && "Compila tutti i campi per continuare"}
                {currentStep === 2 && "Seleziona almeno un obiettivo"}
                {currentStep === 3 && "Seleziona il tuo livello di esperienza"}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Indietro
          </Button>
          <Button
            onClick={nextStep}
            className={`btn-primary ${
              currentStep > 0 && currentStep < steps.length - 1 && !validateCurrentStep()
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            disabled={currentStep > 0 && currentStep < steps.length - 1 && !validateCurrentStep()}
          >
            {currentStep === steps.length - 1 ? 'Completa' : 'Avanti'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Step Components
const WelcomeStep = ({ user }) => (
  <div className="text-center py-8">
    <div className="text-6xl mb-6">🏋️‍♂️</div>
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
      Ciao {user?.email || 'utente'}!
    </h2>
    <p className="text-gray-600 text-lg leading-relaxed">
      Benvenuto nell'App Fitness di Fabio & Iarno.
      Questo breve setup ci aiuterà a personalizzare la tua esperienza
      e creare un piano di allenamento perfetto per te.
    </p>
  </div>
);

const PersonalInfoStep = ({ profile, updateProfile }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Età <span className="text-red-500">*</span>
        </label>
        <Input
          type="number"
          value={profile.age}
          onChange={(e) => updateProfile({ age: e.target.value })}
          placeholder="Es: 25"
          className={!profile.age ? 'border-red-300' : ''}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Peso (kg) <span className="text-red-500">*</span>
        </label>
        <Input
          type="number"
          value={profile.weight}
          onChange={(e) => updateProfile({ weight: e.target.value })}
          placeholder="Es: 70"
          className={!profile.weight ? 'border-red-300' : ''}
          required
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Altezza (cm) <span className="text-red-500">*</span>
      </label>
      <Input
        type="number"
        value={profile.height}
        onChange={(e) => updateProfile({ height: e.target.value })}
        placeholder="Es: 175"
        className={!profile.height ? 'border-red-300' : ''}
        required
      />
    </div>
    <p className="text-xs text-gray-500">
      <span className="text-red-500">*</span> Campi obbligatori
    </p>
  </div>
);

const GoalsStep = ({ profile, updateProfile }) => {
  const goals = [
    { id: 'weight_loss', label: 'Perdere peso', icon: '📉' },
    { id: 'muscle_gain', label: 'Aumentare massa muscolare', icon: '💪' },
    { id: 'endurance', label: 'Migliorare resistenza', icon: '🏃‍♂️' },
    { id: 'strength', label: 'Aumentare forza', icon: '🏋️‍♂️' },
    { id: 'flexibility', label: 'Migliorare flessibilità', icon: '🧘‍♀️' },
    { id: 'general_fitness', label: 'Forma fisica generale', icon: '⚡' }
  ];

  const toggleGoal = (goalId) => {
    const currentGoals = profile.goals || [];
    const updatedGoals = currentGoals.includes(goalId)
      ? currentGoals.filter(g => g !== goalId)
      : [...currentGoals, goalId];
    updateProfile({ goals: updatedGoals });
  };

  return (
    <div>
      <p className="text-gray-600 mb-6 text-center">
        Seleziona uno o più obiettivi che vuoi raggiungere: <span className="text-red-500">*</span>
      </p>
      <div className="grid grid-cols-2 gap-4">
        {goals.map(goal => (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              (profile.goals || []).includes(goal.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">{goal.icon}</div>
            <div className="font-medium text-gray-800">{goal.label}</div>
          </button>
        ))}
      </div>
      {(!profile.goals || profile.goals.length === 0) && (
        <p className="text-xs text-red-500 text-center mt-4">
          <span className="text-red-500">*</span> Seleziona almeno un obiettivo per continuare
        </p>
      )}
    </div>
  );
};

const ExperienceStep = ({ profile, updateProfile }) => {
  const levels = [
    { id: 'beginner', label: 'Principiante', desc: 'Nuovo al fitness o meno di 6 mesi' },
    { id: 'intermediate', label: 'Intermedio', desc: '6 mesi - 2 anni di esperienza' },
    { id: 'advanced', label: 'Avanzato', desc: 'Più di 2 anni di allenamento costante' }
  ];

  return (
    <div>
      <p className="text-gray-600 mb-6 text-center">
        Seleziona il tuo livello di esperienza attuale: <span className="text-red-500">*</span>
      </p>
      <div className="space-y-4">
        {levels.map(level => (
          <button
            key={level.id}
            onClick={() => updateProfile({ experience: level.id })}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              profile.experience === level.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-800 mb-1">{level.label}</div>
            <div className="text-sm text-gray-600">{level.desc}</div>
          </button>
        ))}
      </div>
      {!profile.experience && (
        <p className="text-xs text-red-500 text-center mt-4">
          <span className="text-red-500">*</span> Seleziona il tuo livello di esperienza per continuare
        </p>
      )}
    </div>
  );
};

const CompletionStep = ({ profile }) => (
  <div className="text-center py-8">
    <div className="text-6xl mb-6">🎉</div>
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
      Perfetto! Sei pronto per iniziare
    </h2>
    <p className="text-gray-600 text-lg mb-6">
      Abbiamo configurato tutto in base alle tue preferenze.
      Ora puoi iniziare il tuo percorso fitness personalizzato!
    </p>
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-medium text-gray-800 mb-2">Il tuo profilo:</h3>
      <div className="text-sm text-gray-600 space-y-1">
        {profile.age && <p>Età: {profile.age} anni</p>}
        {profile.weight && <p>Peso: {profile.weight} kg</p>}
        {profile.height && <p>Altezza: {profile.height} cm</p>}
        {profile.experience && <p>Livello: {profile.experience}</p>}
        {profile.goals?.length > 0 && <p>Obiettivi: {profile.goals.length} selezionati</p>}
      </div>
    </div>
  </div>
);

export default OnboardingFlow;