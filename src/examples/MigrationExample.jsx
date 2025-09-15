import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import { UserSelector } from '../features/users';
import { useUserManagement, useProgress } from '../hooks';

/**
 * Esempio pratico di migrazione step-by-step
 * Mostra come sostituire gradualmente il codice del monolite
 */
const MigrationExample = () => {
  const [migrationStep, setMigrationStep] = useState(0);
  const { currentUser, selectUser, availableUsers } = useUserManagement();

  const migrationSteps = [
    {
      title: "Step 0: Codice Originale (Monolite)",
      description: "Tutto in App.jsx - 37K token in un file",
      before: `// App.jsx (37,000+ token)
function App() {
  const [currentUser, setCurrentUser] = useState("Fabio");
  const [progress, setProgress] = useState({});

  // 1000+ linee di codice inline
  const handleUserChange = (user) => {
    setCurrentUser(user);
    // Logic scattered throughout
  };

  // Rendering tutto inline...
  return (
    <div>
      {/* 2000+ linee di JSX */}
    </div>
  );
}`,
      after: null,
      status: "baseline"
    },
    {
      title: "Step 1: Estrazione User Management",
      description: "Separare la logica utenti in hook dedicato",
      before: `// PRIMA: Logic embedded in App.jsx
const [currentUser, setCurrentUser] = useState("Fabio");
const USERS = { /* hardcoded data */ };

const handleUserSelection = (userName) => {
  setCurrentUser(userName);
  // Scattered logic...
};`,
      after: `// DOPO: Hook dedicato
import { useUserManagement } from './hooks';

const {
  currentUser,
  selectUser,
  availableUsers
} = useUserManagement();

// Logic centralizzata e riusabile`,
      status: migrationStep >= 1 ? "completed" : "pending"
    },
    {
      title: "Step 2: Componenti UI Riusabili",
      description: "Sostituire JSX inline con componenti atomici",
      before: `// PRIMA: Inline styling e logic
<button
  className="flex-1 py-2 px-4 text-center rounded-lg
             transition-all duration-200 bg-blue-600
             hover:bg-blue-700 text-white"
  onClick={handleClick}
>
  {loading ? 'Loading...' : 'Continua'}
</button>`,
      after: `// DOPO: Componente riusabile
import { Button } from './components/ui';

<Button
  variant="primary"
  loading={loading}
  onClick={handleClick}
>
  Continua
</Button>`,
      status: migrationStep >= 2 ? "completed" : "pending"
    },
    {
      title: "Step 3: Separazione Screen Components",
      description: "Ogni screen diventa un componente modulare",
      before: `// PRIMA: Tutto in App.jsx
const renderProgressScreen = () => {
  // 500+ linee inline
  return <div>{/* Complex JSX */}</div>;
};

// Switch inline nel render
{activeTab === 'progress' && renderProgressScreen()}`,
      after: `// DOPO: Screen modulare
import { ProgressScreen } from './screens';

// In App.jsx
{activeTab === 'progress' &&
  <ProgressScreen
    user={currentUser}
    progress={progress}
  />
}`,
      status: migrationStep >= 3 ? "completed" : "pending"
    },
    {
      title: "Step 4: Business Logic Hooks",
      description: "Estrarre logiche complesse in custom hooks",
      before: `// PRIMA: Logic scattered in component
const [progress, setProgress] = useState({});
const [measurements, setMeasurements] = useState({});

useEffect(() => {
  // 100+ linee di Firebase logic
  const unsubscribe = onSnapshot(/*...*/);
  return unsubscribe;
}, [currentUser]);`,
      after: `// DOPO: Hook dedicato
import { useProgress, useWeeklyMeasurements } from './hooks';

const progress = useProgress(currentUser.id);
const measurements = useWeeklyMeasurements(currentUser.id);

// Logic nascosta, interface pulita`,
      status: migrationStep >= 4 ? "completed" : "pending"
    }
  ];

  const currentStep = migrationSteps[migrationStep];

  const renderStepStatus = (status) => {
    const statusConfig = {
      completed: { color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
      pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '⏳' },
      baseline: { color: 'text-gray-600', bg: 'bg-gray-50', icon: '📄' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
        {config.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderLiveExample = () => {
    if (migrationStep === 0) {
      return (
        <Card padding="lg" className="bg-red-50 border-red-200">
          <h3 className="font-semibold text-red-800 mb-2">Monolite Originale</h3>
          <p className="text-red-700 text-sm">
            37,000+ token in un singolo file App.jsx<br/>
            Logic scattered, hard to maintain, non scalabile
          </p>
        </Card>
      );
    }

    if (migrationStep >= 1 && availableUsers.length > 0) {
      return (
        <Card padding="lg" className="bg-green-50 border-green-200">
          <h3 className="font-semibold text-green-800 mb-4">Live Example - User Management</h3>

          {!currentUser ? (
            <div className="space-y-4">
              <p className="text-green-700 text-sm">
                Hook useUserManagement() attivo - Seleziona un utente:
              </p>
              <div className="space-y-2">
                {availableUsers.map(user => (
                  <Button
                    key={user.id}
                    variant="secondary"
                    size="sm"
                    onClick={() => selectUser(user.id)}
                    className="w-full"
                  >
                    {user.name} ({user.startWeight}kg → {user.goalWeight}kg)
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-green-700 text-sm">
                ✅ Utente attivo: <strong>{currentUser.name}</strong>
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectUser(null)}
              >
                Cambia Utente
              </Button>
            </div>
          )}
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Migrazione Step-by-Step
          </h1>
          <p className="text-gray-600">
            Dal monolite all'architettura modulare
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {migrationSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index <= migrationStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index}
                </div>
                <span className="text-xs mt-1 text-center max-w-20">
                  Step {index}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${(migrationStep / (migrationSteps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <Card padding="lg" className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentStep.title}
              </h2>
              <p className="text-gray-600 mt-1">
                {currentStep.description}
              </p>
            </div>
            {renderStepStatus(currentStep.status)}
          </div>

          {/* Code Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentStep.before && (
              <div>
                <h3 className="font-semibold text-red-700 mb-2">❌ Prima</h3>
                <pre className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs overflow-x-auto">
                  <code>{currentStep.before}</code>
                </pre>
              </div>
            )}

            {currentStep.after && (
              <div>
                <h3 className="font-semibold text-green-700 mb-2">✅ Dopo</h3>
                <pre className="bg-green-50 border border-green-200 rounded-lg p-4 text-xs overflow-x-auto">
                  <code>{currentStep.after}</code>
                </pre>
              </div>
            )}
          </div>
        </Card>

        {/* Live Example */}
        {renderLiveExample()}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="secondary"
            disabled={migrationStep === 0}
            onClick={() => setMigrationStep(migrationStep - 1)}
          >
            ← Precedente
          </Button>

          <div className="text-sm text-gray-500">
            Step {migrationStep + 1} di {migrationSteps.length}
          </div>

          <Button
            variant="primary"
            disabled={migrationStep === migrationSteps.length - 1}
            onClick={() => setMigrationStep(migrationStep + 1)}
          >
            Successivo →
          </Button>
        </div>

        {/* Benefits Summary */}
        {migrationStep === migrationSteps.length - 1 && (
          <Card padding="lg" className="mt-8 bg-blue-50 border-blue-200">
            <h3 className="font-bold text-blue-800 mb-4">🎉 Migrazione Completata!</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-blue-700">Manutenibilità</h4>
                <p className="text-blue-600">Codice organizzato in moduli logici</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700">Scalabilità</h4>
                <p className="text-blue-600">Sistema utenti illimitato</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700">Performance</h4>
                <p className="text-blue-600">Componenti ottimizzati</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MigrationExample;