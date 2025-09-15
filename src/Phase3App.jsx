import React, { useState } from 'react';
import { UserSelector, useUserManagement } from './features/users';
import { ProgressScreen } from './features/progress';
import { WorkoutScreen } from './features/workouts';
import { TabNavigation } from './components/navigation';
import { useProgress } from './hooks';

/**
 * Phase 3 Migration Demo - WorkoutScreen Integration
 * Dimostra l'integrazione del nuovo WorkoutScreen modulare
 */
const Phase3App = () => {
  const { currentUser, selectUser, updateUser, isLoggedIn } = useUserManagement();
  const [activeTab, setActiveTab] = useState('workouts');
  const [isScrolled, setIsScrolled] = useState(false);

  // Hook per gestione progresso workout
  const { progress, updateProgress } = useProgress(currentUser?.id);

  const tabs = [
    { id: 'workouts', label: 'Allenamenti', icon: '💪' },
    { id: 'progress', label: 'Progressi', icon: '📊' },
    { id: 'today', label: 'Oggi', icon: '📅' },
    { id: 'nutrition', label: 'Nutrizione', icon: '🥗' }
  ];

  // Scroll detection for workout timer
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Se non c'è utente, mostra UserSelector
  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="absolute top-4 right-4">
          <div className="bg-white rounded-lg shadow-md p-3 text-sm">
            <p className="font-semibold text-purple-600">🚀 Phase 3 Demo</p>
            <p className="text-gray-600">WorkoutScreen Migration</p>
          </div>
        </div>
        <UserSelector />
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'workouts':
        return (
          <WorkoutScreen
            user={currentUser}
            progress={progress.progress || {}}
            updateProgress={updateProgress}
            isScrolled={isScrolled}
          />
        );

      case 'progress':
        return (
          <ProgressScreen
            user={currentUser}
            onUpdateUser={async (updatedUser) => {
              await updateUser(currentUser.id, updatedUser);
            }}
          />
        );

      case 'today':
        return (
          <div className="max-w-4xl mx-auto p-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <h2 className="text-xl font-bold text-yellow-800 mb-2">
                🚧 Screen in Migrazione
              </h2>
              <p className="text-yellow-700">
                TodayScreen sarà migrato nella Phase 4
              </p>
            </div>
          </div>
        );

      case 'nutrition':
        return (
          <div className="max-w-4xl mx-auto p-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <h2 className="text-xl font-bold text-green-800 mb-2">
                🚧 Screen in Migrazione
              </h2>
              <p className="text-green-700">
                NutritionScreen sarà migrato nella Phase 4
              </p>
            </div>
          </div>
        );

      default:
        return <WorkoutScreen user={currentUser} progress={progress.progress || {}} updateProgress={updateProgress} isScrolled={isScrolled} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">App Fitness</h1>
            <p className="text-sm text-gray-600">
              Phase 3: WorkoutScreen Migrato | Utente: <span className="font-medium">{currentUser.name}</span>
            </p>
          </div>

          <div className="text-right">
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs">
              <p className="font-semibold text-green-800">✅ Migration Status</p>
              <p className="text-green-600">UserSelector: ✅</p>
              <p className="text-green-600">ProgressScreen: ✅</p>
              <p className="text-green-600">WorkoutScreen: ✅</p>
              <p className="text-gray-500">TodayScreen: 🔄</p>
            </div>
            <button
              onClick={() => selectUser(null)}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              Cambia Utente
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-20">
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        fixed={true}
      />

      {/* Workout Features Showcase */}
      {activeTab === 'workouts' && (
        <div className="fixed bottom-20 left-4 z-10">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs max-w-xs">
            <p className="font-semibold text-purple-800 mb-1">🏋️‍♂️ Workout Features</p>
            <ul className="text-purple-700 space-y-1">
              <li>✅ Timer recupero modulare</li>
              <li>✅ Exercise tracking completo</li>
              <li>✅ Set/reps management</li>
              <li>✅ Weekly view navigation</li>
              <li>✅ Progress visualization</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Phase3App;