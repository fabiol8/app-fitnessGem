import React, { useState, useEffect } from 'react';
import { TabNavigation } from './components/navigation';
import { useFirestore } from './hooks/useFirestore';
import { useUserManagement } from './features/users/hooks/useUserManagement';

// Import all migrated screens
import UserSelector from './features/users/components/UserSelector';
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

const FinalMigratedApp = () => {
  const [activeTab, setActiveTab] = useState('today');
  const {
    users,
    currentUser,
    selectUser,
    addUser,
    deleteUser
  } = useUserManagement();

  const {
    data: progress,
    updateData: updateProgress,
    isLoading: progressLoading,
    error: progressError
  } = useFirestore('progress', currentUser?.id);

  const [fastingDays, setFastingDays] = useState({
    '2025-01-15': true,
    '2025-01-17': true,
    '2025-01-19': true
  });

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

  // Show user selector if no user is selected
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BackgroundGradient />
        <div className="container mx-auto px-4 py-8">
          <UserSelector
            users={users}
            onSelectUser={selectUser}
            onAddUser={addUser}
            onDeleteUser={deleteUser}
          />
        </div>
      </div>
    );
  }

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
          <div className="text-lg font-semibold text-slate-700">Caricamento...</div>
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
          <div className="text-sm text-slate-500">Controlla la connessione internet</div>
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
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{currentUser.name}</h1>
              <p className="text-sm text-slate-500">
                {currentUser.goal} • {currentUser.durationWeeks} settimane
              </p>
            </div>
          </div>

          <button
            onClick={() => selectUser(null)}
            className="text-slate-500 hover:text-slate-700 text-sm"
          >
            Cambia utente
          </button>
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

export default FinalMigratedApp;