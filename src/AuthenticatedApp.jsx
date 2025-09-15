import React, { useState, useEffect } from 'react';
import { TabNavigation } from './components/navigation';
import { useFirestore } from './hooks/useFirestore';
import { useAuth } from './features/auth/hooks/useAuth';

// Import all migrated screens
import TodayScreen from './features/today/components/TodayScreen';
import ProgressScreen from './features/progress/components/ProgressScreen';
import WorkoutScreen from './features/workouts/components/WorkoutScreen';
import NutritionScreen from './features/nutrition/components/NutritionScreen';
import MindfulnessScreen from './features/mindfulness/components/MindfulnessScreen';

// Import background gradient component
const BackgroundGradient = () => (
  <div className="fixed inset-0 -z-10">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
    <div className="absolute top-0 left-0 w-full h-full opacity-30">
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
      <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
    </div>
  </div>
);

const AuthenticatedApp = () => {
  const [activeTab, setActiveTab] = useState('today');
  const { user, userProfile, signOut, getUserDisplayName, getUserInitials } = useAuth();

  const {
    data: progress,
    updateData: updateProgress,
    isLoading: progressLoading,
    error: progressError
  } = useFirestore('progress', user?.uid);

  // Convert userProfile to compatible user object for existing components
  const currentUser = userProfile ? {
    id: user.uid,
    name: userProfile.name || getUserDisplayName(),
    email: user.email,
    startDate: userProfile.startDate || new Date().toISOString().slice(0, 10),
    endDate: userProfile.endDate,
    startWeight: userProfile.currentWeight,
    goalWeight: userProfile.targetWeight,
    intermediateGoalWeight: userProfile.intermediateGoalWeight,
    durationWeeks: userProfile.durationWeeks || 12,
    height: userProfile.height,
    dailyCalories: userProfile.dailyCalories || 2000,
    dailyProtein: userProfile.dailyProtein || 120,
    dailyCarbs: userProfile.dailyCarbs || 250,
    dailyFats: userProfile.dailyFats || 65,
    goals: userProfile.goals || [],
    primaryGoal: userProfile.primaryGoal,
    activityLevel: userProfile.activityLevel || 'moderate',
    experience: userProfile.experience || 'beginner',
    workoutDays: userProfile.workoutDays || 3,
    preferences: userProfile.preferences || {},
    startMeasurements: userProfile.startMeasurements || {},
    goalMeasurements: userProfile.goalMeasurements || {}
  } : null;

  const [fastingDays, setFastingDays] = useState({});

  // Initialize animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }
      .animate-blob {
        animation: blob 7s infinite;
      }
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      .animation-delay-4000 {
        animation-delay: 4s;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    if (window.confirm('Sei sicuro di voler disconnetterti?')) {
      await signOut();
    }
  };

  // Tab configuration
  const tabs = [
    {
      id: 'today',
      label: 'Oggi',
      icon: '📅',
      component: TodayScreen
    },
    {
      id: 'workout',
      label: 'Allenamento',
      icon: '🏋️‍♂️',
      component: WorkoutScreen
    },
    {
      id: 'nutrition',
      label: 'Nutrizione',
      icon: '🍽️',
      component: NutritionScreen
    },
    {
      id: 'progress',
      label: 'Progressi',
      icon: '📊',
      component: ProgressScreen
    },
    {
      id: 'mindfulness',
      label: 'Mindfulness',
      icon: '🧘',
      component: MindfulnessScreen
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || TodayScreen;

  // Calculate notification badges
  const getNotificationCount = (tabId) => {
    const today = new Date().toISOString().slice(0, 10);

    switch (tabId) {
      case 'today':
        // Count incomplete daily activities
        const dailyActivities = 10; // Total activities per day
        const completedActivities = Object.keys(progress || {}).filter(key =>
          key.startsWith(`activity_${today}_`)
        ).length;
        return Math.max(0, dailyActivities - completedActivities);

      case 'workout':
        // Check if today's workout is incomplete
        const todaysWorkout = Object.values(progress || {}).find(item =>
          item.type === 'workout' && item.date === today && !item.completed
        );
        return todaysWorkout ? 1 : 0;

      case 'nutrition':
        // Count how many meals are missing (target: 5 meals per day)
        const todaysMeals = Object.keys(progress || {}).filter(key =>
          key.startsWith(`meal_${today}_`)
        ).length;
        return Math.max(0, 5 - todaysMeals);

      case 'progress':
        // Show badge if it's Monday (measurement day)
        const isMonday = new Date().getDay() === 1;
        const hasWeeklyMeasurement = Object.keys(progress || {}).some(key =>
          key.startsWith(`measurement_${today}`)
        );
        return isMonday && !hasWeeklyMeasurement ? 1 : 0;

      case 'mindfulness':
        // Count missing mindfulness sessions (target: 2 per day)
        const mindfulnessSessions = Object.keys(progress || {}).filter(key =>
          (key.startsWith('meditation_') || key.startsWith('breathing_')) && key.includes(today)
        ).length;
        return Math.max(0, 2 - mindfulnessSessions);

      default:
        return 0;
    }
  };

  if (progressLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <BackgroundGradient />
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg font-semibold text-slate-700">Caricamento dati...</div>
        </div>
      </div>
    );
  }

  if (progressError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <BackgroundGradient />
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-lg font-semibold text-slate-700 mb-2">Errore di connessione</div>
          <div className="text-sm text-slate-500 mb-4">Controlla la connessione internet</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <BackgroundGradient />
        <div className="text-center">
          <div className="text-4xl mb-4">👤</div>
          <div className="text-lg font-semibold text-slate-700">Caricamento profilo...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BackgroundGradient />

      <div className="container mx-auto px-4 py-4 pb-20">
        {/* Header with User Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {getUserInitials()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{getUserDisplayName()}</h1>
              <p className="text-sm text-slate-500">
                {currentUser.primaryGoal ? currentUser.primaryGoal.replace('_', ' ') : 'Fitness Journey'} • {currentUser.workoutDays} giorni/settimana
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Settings/Profile Button */}
            <button
              onClick={() => {
                // TODO: Open profile settings modal
                console.log('Open profile settings');
              }}
              className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-white/50"
              title="Impostazioni profilo"
            >
              ⚙️
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-slate-700 text-sm underline"
              title="Disconnetti"
            >
              Esci
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="mb-6">
          <ActiveComponent
            user={currentUser}
            progress={progress || {}}
            updateProgress={updateProgress}
            fastingDays={fastingDays}
          />
        </main>
      </div>

      {/* Bottom Navigation */}
      <TabNavigation
        tabs={tabs.map(tab => ({
          ...tab,
          badge: getNotificationCount(tab.id)
        }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default AuthenticatedApp;