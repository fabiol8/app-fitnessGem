import React, { useEffect, useMemo, useState } from 'react';
import { Card, Button, Input } from '../../../components/ui';

const GOAL_OPTIONS = [
  'weight_loss',
  'muscle_gain',
  'endurance',
  'strength',
  'flexibility',
  'general_fitness'
];

const DIET_OPTIONS = [
  { value: 'balanced', label: 'Equilibrata' },
  { value: 'mediterranean', label: 'Mediterranea' },
  { value: 'high_protein', label: 'Altamente proteica' },
  { value: 'low_carb', label: 'Low Carb' },
  { value: 'plant_based', label: 'Vegetariana/Vegana' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzato' },
];

const WORKOUT_TIME_OPTIONS = [
  { value: 'morning', label: 'Mattina' },
  { value: 'afternoon', label: 'Pomeriggio' },
  { value: 'evening', label: 'Sera' }
];

const RESTRICTION_OPTIONS = [
  'senza glutine',
  'senza lattosio',
  'vegano',
  'vegetariano',
  'frutta secca',
  'crostate e molluschi'
];

const TRAINING_ENVIRONMENT_OPTIONS = [
  { value: 'home', label: 'Allenamenti a casa' },
  { value: 'gym', label: 'Palestra' },
  { value: 'swimming', label: 'Piscina' },
  { value: 'running', label: 'Corsa outdoor' },
  { value: 'mixed', label: 'Mix personalizzato' },
];

const defaultProfileState = initialProfile => ({
  age: initialProfile?.age ? String(initialProfile.age) : '',
  gender: initialProfile?.gender || '',
  weight: getNumericString(initialProfile?.fitnessProfile?.currentWeight || initialProfile?.weight),
  targetWeight: getNumericString(initialProfile?.fitnessProfile?.targetWeight),
  height: getNumericString(initialProfile?.fitnessProfile?.height || initialProfile?.height),
  goals: initialProfile?.fitnessProfile?.goals || initialProfile?.goals || [],
  experience: initialProfile?.fitnessProfile?.activityLevel || initialProfile?.experienceLevel || '',
  weeklyWorkouts: String(initialProfile?.weeklyWorkouts || initialProfile?.fitnessProfile?.weeklyWorkouts || 3),
  trainingEnvironment: initialProfile?.trainingPreferences?.environment ||
    initialProfile?.fitnessProfile?.trainingEnvironment ||
    ['home'],
  preferredWorkoutTime: initialProfile?.fitnessProfile?.preferredWorkoutTime || initialProfile?.preferredWorkoutTime || 'morning',
  nutrition: {
    dietType: initialProfile?.nutrition?.dietType || initialProfile?.fitnessProfile?.nutrition?.dietType || 'balanced',
    restrictions: initialProfile?.nutrition?.restrictions || initialProfile?.fitnessProfile?.nutrition?.restrictions || [],
    excludeFoods: initialProfile?.nutrition?.excludeFoods || initialProfile?.fitnessProfile?.nutrition?.excludeFoods || '',
  },
  preferences: {
    notifications: initialProfile?.preferences?.notifications ?? initialProfile?.fitnessProfile?.preferences?.notifications ?? true,
    shareProfile: (initialProfile?.preferences?.privacy || initialProfile?.fitnessProfile?.preferences?.privacy) === 'public',
    units: initialProfile?.preferences?.units || initialProfile?.fitnessProfile?.preferences?.units || 'metric',
  },
});

function getNumericString(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  return String(value);
}

const OnboardingFlow = ({ onComplete, user, initialProfile }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState(() => defaultProfileState(initialProfile));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setProfile(defaultProfileState(initialProfile));
    }
  }, [initialProfile]);

  const steps = useMemo(() => [
    {
      title: 'Benvenuto nell\'App Fitness!',
      subtitle: 'Iniziamo a configurare il tuo profilo personale',
      component: WelcomeStep,
    },
    {
      title: 'Informazioni personali',
      subtitle: 'Conosciamoci meglio per offrirti suggerimenti su misura',
      component: PersonalInfoStep,
    },
    {
      title: 'I tuoi obiettivi',
      subtitle: 'Seleziona gli obiettivi principali del tuo percorso fitness',
      component: GoalsStep,
    },
    {
      title: 'Livello di esperienza',
      subtitle: 'Definisci il tuo livello e le tue preferenze di allenamento',
      component: ExperienceStep,
    },
    {
      title: 'Preferenze alimentari',
      subtitle: 'Personalizziamo anche il piano nutrizionale',
      component: NutritionStep,
    },
    {
      title: 'Preferenze app',
      subtitle: 'Come vuoi che l\'app gestisca notifiche e privacy',
      component: PreferencesStep,
    },
    {
      title: 'Riepilogo',
      subtitle: 'Controlla e conferma le informazioni prima di iniziare',
      component: SummaryStep,
    }
  ], [initialProfile, profile, user]);

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return profile.age && profile.weight && profile.height;
      case 2:
        return profile.goals && profile.goals.length > 0;
      case 3:
        return profile.experience && profile.weeklyWorkouts && profile.trainingEnvironment.length > 0;
      case 4:
        return Boolean(profile.nutrition?.dietType);
      default:
        return true;
    }
  };

  const getValidationMessage = () => {
    switch (currentStep) {
      case 1:
        return 'Inserisci età, peso e altezza per continuare.';
      case 2:
        return 'Seleziona almeno un obiettivo fitness.';
      case 3:
        return 'Indica il tuo livello, i giorni di allenamento e dove ti alleni.';
      case 4:
        return 'Scegli uno stile alimentare per proseguire.';
      default:
        return null;
    }
  };

  const validateAll = () => {
    const missing = [];
    if (!profile.age) missing.push('età');
    if (!profile.weight) missing.push('peso');
    if (!profile.height) missing.push('altezza');
    if (!profile.goals?.length) missing.push('obiettivi');
    if (!profile.experience) missing.push('livello esperienza');
    if (!profile.trainingEnvironment?.length) missing.push('ambienti allenamento');
    if (!profile.nutrition?.dietType) missing.push('preferenze alimentari');
    return missing;
  };

  const updateProfile = updates => setProfile(prev => ({ ...prev, ...updates }));

  const toggleGoal = goal => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(item => item !== goal)
        : [...prev.goals, goal],
    }));
  };

  const toggleTrainingEnvironment = environment => {
    setProfile(prev => ({
      ...prev,
      trainingEnvironment: prev.trainingEnvironment.includes(environment)
        ? prev.trainingEnvironment.filter(item => item !== environment)
        : [...prev.trainingEnvironment, environment],
    }));
  };

  const updateNutrition = updates => {
    setProfile(prev => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        ...updates,
      },
    }));
  };

  const toggleRestriction = restriction => {
    setProfile(prev => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        restrictions: prev.nutrition.restrictions.includes(restriction)
          ? prev.nutrition.restrictions.filter(item => item !== restriction)
          : [...prev.nutrition.restrictions, restriction],
      },
    }));
  };

  const updatePreferences = updates => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...updates,
      },
    }));
  };

  const handleNext = async () => {
    if (isSubmitting) return;

    const isLastStep = currentStep === steps.length - 1;

    if (!isLastStep && currentStep > 0 && currentStep < steps.length - 1 && !validateCurrentStep()) {
      return;
    }

    if (!isLastStep) {
      setCurrentStep(step => Math.min(step + 1, steps.length - 1));
      return;
    }

    const missingFields = validateAll();
    if (missingFields.length > 0) {
      alert(`Completa questi campi: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete({
        ...profile,
        age: Number(profile.age),
        weight: profile.weight ? Number(profile.weight) : null,
        targetWeight: profile.targetWeight ? Number(profile.targetWeight) : null,
        height: profile.height ? Number(profile.height) : null,
        weeklyWorkouts: profile.weeklyWorkouts ? Number(profile.weeklyWorkouts) : 3,
        trainingEnvironment: profile.trainingEnvironment,
        nutrition: {
          ...profile.nutrition,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (isSubmitting) return;
    setCurrentStep(step => Math.max(step - 1, 0));
  };

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;
  const validationMessage = getValidationMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl p-8">
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

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {steps[currentStep].title}
          </h1>
          <p className="text-gray-600">
            {steps[currentStep].subtitle}
          </p>
        </div>

        <CurrentStepComponent
          profile={profile}
          updateProfile={updateProfile}
          updateNutrition={updateNutrition}
          toggleGoal={toggleGoal}
          toggleRestriction={toggleRestriction}
          toggleTrainingEnvironment={toggleTrainingEnvironment}
          updatePreferences={updatePreferences}
          user={user}
        />

        {validationMessage && currentStep > 0 && currentStep < steps.length - 1 && !validateCurrentStep() && (
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-amber-500">⚠️</span>
              <span className="text-amber-700 text-sm">{validationMessage}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0 || isSubmitting}
          >
            Indietro
          </Button>
          <Button
            onClick={handleNext}
            className={`${
              currentStep > 0 && currentStep < steps.length - 1 && !validateCurrentStep()
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            disabled={
              isSubmitting ||
              (currentStep > 0 && currentStep < steps.length - 1 && !validateCurrentStep())
            }
          >
            {isSubmitting ? 'Salvataggio...' : currentStep === steps.length - 1 ? 'Completa' : 'Avanti'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

const WelcomeStep = ({ user }) => (
  <div className="text-center py-8 space-y-6">
    <div className="text-6xl">🏋️‍♂️</div>
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Ciao {user?.email || 'utente'}!
      </h2>
      <p className="text-gray-600 text-lg leading-relaxed">
        Questo breve setup ci aiuterà a personalizzare allenamenti, nutrizione e suggerimenti.
        Serviranno pochi minuti!
      </p>
    </div>
  </div>
);

const PersonalInfoStep = ({ profile, updateProfile }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Età"
        type="number"
        value={profile.age}
        onChange={e => updateProfile({ age: e.target.value })}
        placeholder="Es. 28"
        min="13"
        max="120"
        required
      />
      <Input
        label="Genere (opzionale)"
        type="text"
        value={profile.gender}
        onChange={e => updateProfile({ gender: e.target.value })}
        placeholder="Es. Donna"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Input
        label="Peso attuale (kg)"
        type="number"
        value={profile.weight}
        onChange={e => updateProfile({ weight: e.target.value })}
        placeholder="72"
        min="30"
        max="300"
        required
      />
      <Input
        label="Peso target (kg)"
        type="number"
        value={profile.targetWeight}
        onChange={e => updateProfile({ targetWeight: e.target.value })}
        placeholder="68"
        min="30"
        max="300"
      />
      <Input
        label="Altezza (cm)"
        type="number"
        value={profile.height}
        onChange={e => updateProfile({ height: e.target.value })}
        placeholder="175"
        min="100"
        max="250"
        required
      />
    </div>
  </div>
);

const GoalsStep = ({ profile, toggleGoal }) => (
  <div className="space-y-6">
    <p className="text-gray-600">Seleziona uno o più obiettivi principali.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {GOAL_OPTIONS.map(goal => {
        const isActive = profile.goals.includes(goal);
        return (
          <button
            key={goal}
            type="button"
            onClick={() => toggleGoal(goal)}
            className={`border rounded-lg px-4 py-3 text-left transition ${
              isActive
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="font-medium capitalize">{goal.replace('_', ' ')}</div>
            {isActive && <div className="text-sm text-blue-500 mt-1">Selezionato</div>}
          </button>
        );
      })}
    </div>
  </div>
);

const ExperienceStep = ({ profile, updateProfile, toggleTrainingEnvironment }) => (
  <div className="space-y-6">
    <div>
      <p className="text-gray-600 mb-4">Qual è il tuo livello di allenamento?</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {EXPERIENCE_OPTIONS.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateProfile({ experience: option.value })}
            className={`border rounded-lg px-4 py-3 transition ${
              profile.experience === option.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="font-medium">{option.label}</div>
            <div className="text-xs text-gray-500 mt-2">
              {option.value === 'beginner' && 'Sto iniziando ora'}
              {option.value === 'intermediate' && 'Mi alleno regolarmente'}
              {option.value === 'advanced' && 'Ho esperienza avanzata'}
            </div>
          </button>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Allenamenti a settimana"
        type="number"
        min="1"
        max="7"
        value={profile.weeklyWorkouts}
        onChange={e => updateProfile({ weeklyWorkouts: e.target.value })}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Momento preferito della giornata
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          value={profile.preferredWorkoutTime}
          onChange={e => updateProfile({ preferredWorkoutTime: e.target.value })}
        >
          {WORKOUT_TIME_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div>
      <p className="text-gray-600 mb-4">Dove ti vuoi allenare?</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TRAINING_ENVIRONMENT_OPTIONS.map(option => {
          const isActive = profile.trainingEnvironment.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleTrainingEnvironment(option.value)}
              className={`border rounded-lg px-4 py-3 transition text-left ${
                isActive
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              {isActive && <div className="text-xs text-purple-500 mt-1">Selezionato</div>}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

const NutritionStep = ({ profile, updateNutrition, toggleRestriction }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Stile alimentare principale
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DIET_OPTIONS.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateNutrition({ dietType: option.value })}
            className={`border rounded-lg px-4 py-3 transition ${
              profile.nutrition.dietType === option.value
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="font-medium">{option.label}</div>
          </button>
        ))}
      </div>
    </div>

    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Restrizioni o preferenze</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {RESTRICTION_OPTIONS.map(restriction => {
          const isChecked = profile.nutrition.restrictions.includes(restriction);
          return (
            <label
              key={restriction}
              className={`flex items-center space-x-2 border rounded-lg px-4 py-2 cursor-pointer transition ${
                isChecked ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleRestriction(restriction)}
                className="rounded border-gray-300 text-purple-600"
              />
              <span className="text-sm capitalize">{restriction}</span>
            </label>
          );
        })}
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Alimenti da escludere (allergie o preferenze)
      </label>
      <textarea
        className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[90px]"
        placeholder="Es. arachidi, crostacei, capra..."
        value={profile.nutrition.excludeFoods}
        onChange={e => updateNutrition({ excludeFoods: e.target.value })}
      />
    </div>
  </div>
);

const PreferencesStep = ({ profile, updatePreferences }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700">Notifiche</span>
          <button
            type="button"
            onClick={() => updatePreferences({ notifications: !profile.preferences.notifications })}
            className={`flex items-center px-3 py-1 rounded-full text-xs font-medium transition ${
              profile.preferences.notifications
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${
              profile.preferences.notifications ? 'bg-green-500' : 'bg-red-500'
            }`} />
            {profile.preferences.notifications ? 'On' : 'Off'}
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Ricevi promemoria per gli allenamenti e aggiornamenti sui progressi.
        </p>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 flex items-start space-x-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
          checked={profile.preferences.shareProfile}
          onChange={e => updatePreferences({ shareProfile: e.target.checked })}
        />
        <div>
          <p className="font-medium text-gray-700">Rendi il mio profilo visibile agli altri</p>
          <p className="text-sm text-gray-500">
            Se attivato, gli amici potranno vedere i tuoi progressi e il tuo piano.
          </p>
        </div>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Unità di misura</label>
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="units"
            value="metric"
            checked={profile.preferences.units === 'metric'}
            onChange={e => updatePreferences({ units: e.target.value })}
          />
          <span>Metriche (kg, cm)</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="units"
            value="imperial"
            checked={profile.preferences.units === 'imperial'}
            onChange={e => updatePreferences({ units: e.target.value })}
          />
          <span>Imperiali (lb, ft)</span>
        </label>
      </div>
    </div>
  </div>
);

const SummaryStep = ({ profile, user }) => {
  const recommendedCalories = calculateRecommendedCalories(profile);
  const macroSplit = getMacroDistribution(recommendedCalories);
  const workoutPlan = generateWorkoutSchedule(profile);

  return (
  <div className="space-y-6">
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
      <h3 className="font-medium text-blue-800 mb-2">Riepilogo per {user?.email || 'utente'}</h3>
      <p className="text-sm text-blue-700">
        Conferma che le informazioni siano corrette. Potrai sempre modificarle in seguito dal profilo.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SummaryCard
        title="Informazioni personali"
        items={[
          profile.age && `${profile.age} anni`,
          profile.gender,
          profile.height && `${profile.height} cm`,
          profile.weight && `${profile.weight} kg`,
          profile.targetWeight && `Target: ${profile.targetWeight} kg`,
        ]}
      />

      <SummaryCard
        title="Obiettivi"
        items={profile.goals.map(goal => goal.replace('_', ' '))}
      />

      <SummaryCard
        title="Allenamenti"
        items={[
          EXPERIENCE_OPTIONS.find(option => option.value === profile.experience)?.label,
          profile.weeklyWorkouts && `${profile.weeklyWorkouts} sessioni/settimana`,
          WORKOUT_TIME_OPTIONS.find(option => option.value === profile.preferredWorkoutTime)?.label,
          profile.trainingEnvironment.length
            ? `Ambienti: ${profile.trainingEnvironment.map(env => TRAINING_ENVIRONMENT_OPTIONS.find(o => o.value === env)?.label || env).join(', ')}`
            : null,
        ]}
      />

      <SummaryCard
        title="Nutrizione e preferenze"
        items={[
          DIET_OPTIONS.find(option => option.value === profile.nutrition.dietType)?.label,
          `${recommendedCalories} kcal suggerite`,
          macroSplit && `Macronutrienti: P ${macroSplit.protein}g / C ${macroSplit.carbs}g / G ${macroSplit.fat}g`,
          profile.nutrition.restrictions.length ? `Restrizioni: ${profile.nutrition.restrictions.join(', ')}` : null,
          profile.nutrition.excludeFoods ? `Escludi: ${profile.nutrition.excludeFoods}` : null,
          profile.preferences.notifications ? 'Notifiche attive' : 'Notifiche disattivate',
          profile.preferences.shareProfile ? 'Profilo condiviso' : 'Profilo privato',
        ]}
      />
    </div>

    <div className="border border-green-200 bg-green-50 rounded-lg p-4">
      <h4 className="font-medium text-green-800 mb-2">Esempio di piano settimanale suggerito</h4>
      <ul className="text-sm text-green-700 space-y-1">
        {workoutPlan.map((session, index) => (
          <li key={index}>• {session}</li>)
        )}
      </ul>
    </div>
  </div>
);
};

const SummaryCard = ({ title, items }) => {
  const filteredItems = items.filter(Boolean);
  if (!filteredItems.length) return null;

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-800 mb-2">{title}</h4>
      <ul className="text-sm text-gray-600 space-y-1">
        {filteredItems.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </div>
  );
};

export default OnboardingFlow;
export { calculateRecommendedCalories, getMacroDistribution, generateWorkoutSchedule };

function calculateRecommendedCalories(profile) {
  const weight = Number(profile.weight) || 0;
  const height = Number(profile.height) || 0;
  const age = Number(profile.age) || 30;
  const gender = profile.gender?.toLowerCase() || 'other';

  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender.includes('f') || gender.includes('don')) {
    bmr -= 161;
  } else {
    bmr += 5;
  }

  const activityFactor = (() => {
    const workouts = Number(profile.weeklyWorkouts) || 3;
    if (workouts <= 2) return 1.375;
    if (workouts <= 4) return 1.55;
    if (workouts <= 6) return 1.725;
    return 1.9;
  })();

  const experienceFactor = profile.experience === 'advanced' ? 1.05 : profile.experience === 'beginner' ? 0.95 : 1;
  const goalModifier = profile.goals.includes('weight_loss')
    ? 0.9
    : profile.goals.includes('muscle_gain')
      ? 1.1
      : 1;

  return Math.round(bmr * activityFactor * experienceFactor * goalModifier);
}

function getMacroDistribution(calories) {
  if (!calories) return null;
  const proteinCalories = calories * 0.3;
  const carbCalories = calories * 0.45;
  const fatCalories = calories * 0.25;

  return {
    protein: Math.round(proteinCalories / 4),
    carbs: Math.round(carbCalories / 4),
    fat: Math.round(fatCalories / 9),
  };
}

function generateWorkoutSchedule(profile) {
  const days = Number(profile.weeklyWorkouts) || 3;
  const environments = profile.trainingEnvironment?.length ? profile.trainingEnvironment : ['home'];

  const templates = {
    home: ['Circuito full body', 'HIIT rapido', 'Mobilità e stretching'],
    gym: ['Forza parte alta', 'Forza parte bassa', 'Total body con pesi'],
    swimming: ['Tecnica di nuoto', 'Resistenza in vasca', 'Recupero attivo'],
    running: ['Corsa lunga', 'Ripetute veloci', 'Lavoro in salita'],
    mixed: ['Allenamento funzionale', 'Metcon', 'Yoga rigenerante'],
  };

  const selected = environments.flatMap(env => templates[env] || []);
  const plan = [];

  for (let i = 0; i < days; i += 1) {
    const suggestion = selected[i % selected.length] || 'Sessione personalizzata';
    plan.push(`Giorno ${i + 1}: ${suggestion}`);
  }

  return plan;
}
