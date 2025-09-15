import React, { useState } from 'react';
import { UserSelector, useUserManagement } from './features/users';
import { ProgressScreen } from './features/progress';
import { TabNavigation } from './components/navigation';

/**
 * Phase 2 Migration Demo - ProgressScreen Integration
 * Dimostra l'integrazione del nuovo ProgressScreen modulare
 */
const Phase2App = () => {
  const { currentUser, selectUser, updateUser, isLoggedIn } = useUserManagement();
  const [activeTab, setActiveTab] = useState('progress');

  const tabs = [
    { id: 'progress', label: 'Progressi', icon: '📊' },
    { id: 'today', label: 'Oggi', icon: '📅' },
    { id: 'workouts', label: 'Allenamenti', icon: '💪' },
    { id: 'nutrition', label: 'Nutrizione', icon: '🥗' }
  ];

  // Se non c'è utente, mostra UserSelector
  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="absolute top-4 right-4">
          <div className="bg-white rounded-lg shadow-md p-3 text-sm">
            <p className="font-semibold text-blue-600">🚀 Phase 2 Demo</p>
            <p className="text-gray-600">ProgressScreen Migration</p>
          </div>
        </div>
        <UserSelector />
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
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
                TodayScreen sarà migrato nella Phase 3
              </p>
            </div>
          </div>
        );

      case 'workouts':
        return (
          <div className="max-w-4xl mx-auto p-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
              <h2 className="text-xl font-bold text-orange-800 mb-2">
                🚧 Screen in Migrazione
              </h2>
              <p className="text-orange-700">
                WorkoutScreen sarà migrato nella Phase 3
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
        return <ProgressScreen user={currentUser} onUpdateUser={updateUser} />;
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
              Phase 2: ProgressScreen Migrato | Utente: <span className="font-medium">{currentUser.name}</span>
            </p>
          </div>

          <div className="text-right">
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs">
              <p className="font-semibold text-green-800">✅ Migration Status</p>
              <p className="text-green-600">UserSelector: ✅</p>
              <p className="text-green-600">ProgressScreen: ✅</p>
              <p className="text-gray-500">WorkoutScreen: 🔄</p>
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
    </div>
  );
};

export default Phase2App;