import React, { useState } from 'react';
import {
  Button,
  Card,
  Input,
  Modal,
  Timer,
  ProgressBar
} from '../components/ui';
import { TabNavigation } from '../components/navigation';
import { UserSelector, UserProfile } from '../features/users';
import { useTimer, useCountdown, useUserManagement } from '../hooks';

/**
 * Showcase dei nuovi componenti per testare la migrazione
 * Uso: import ComponentShowcase e renderizzarlo per testing
 */
const ComponentShowcase = () => {
  const [activeTab, setActiveTab] = useState('ui');
  const [showModal, setShowModal] = useState(false);
  const [timerDuration, setTimerDuration] = useState(300); // 5 minuti

  // Hooks examples
  const timer = useTimer(timerDuration, {
    onComplete: () => alert('Timer completato!'),
    onTick: (time) => console.log('Timer tick:', time)
  });

  const countdown = useCountdown('2025-12-31', {
    onComplete: () => alert('Happy New Year!')
  });

  const { currentUser, availableUsers, selectUser } = useUserManagement();

  const tabs = [
    { id: 'ui', label: 'UI Components', icon: '🎨' },
    { id: 'navigation', label: 'Navigation', icon: '🧭' },
    { id: 'users', label: 'Users', icon: '👤' },
    { id: 'hooks', label: 'Hooks', icon: '🪝' }
  ];

  const renderUIComponents = () => (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-xl font-bold mb-4">Buttons</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" loading>Loading</Button>
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-xl font-bold mb-4">Cards</h2>
        <div className="grid grid-cols-1 gap-4">
          <Card variant="primary" padding="md">
            <p>Primary Card</p>
          </Card>
          <Card variant="success" padding="md" hover>
            <p>Success Card with Hover</p>
          </Card>
          <Card glass padding="md">
            <p>Glass Card Effect</p>
          </Card>
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-xl font-bold mb-4">Inputs</h2>
        <div className="space-y-4">
          <Input label="Nome" placeholder="Inserisci il tuo nome" />
          <Input label="Peso" type="number" unit="kg" />
          <Input label="Email" type="email" icon="📧" />
          <Input label="Password" type="password" error="Password troppo corta" />
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-xl font-bold mb-4">Progress Bars</h2>
        <div className="space-y-4">
          <ProgressBar value={75} label="Progresso Generale" showLabel />
          <ProgressBar value={45} variant="success" size="lg" />
          <ProgressBar value={90} variant="warning" animated striped />
          <ProgressBar value={30} variant="gradient" size="xl" />
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-xl font-bold mb-4">Modal</h2>
        <Button onClick={() => setShowModal(true)}>
          Apri Modal
        </Button>
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Modal di Esempio"
          size="md"
        >
          <p>Questo è un esempio di modal con tutti i controlli.</p>
          <div className="mt-4 flex space-x-2">
            <Button variant="primary" onClick={() => setShowModal(false)}>
              Conferma
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annulla
            </Button>
          </div>
        </Modal>
      </Card>
    </div>
  );

  const renderNavigationComponents = () => (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-xl font-bold mb-4">Tab Navigation</h2>
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          fixed={false}
        />
      </Card>
    </div>
  );

  const renderUserComponents = () => (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-xl font-bold mb-4">User Management</h2>
        <div className="text-sm space-y-2">
          <p><strong>Current User:</strong> {currentUser?.name || 'Nessuno'}</p>
          <p><strong>Available Users:</strong> {availableUsers.length}</p>
        </div>
      </Card>

      {currentUser && (
        <UserProfile
          user={currentUser}
          onUpdateUser={(id, data) => console.log('Update user:', id, data)}
          onLogout={() => console.log('Logout')}
        />
      )}
    </div>
  );

  const renderHooksExamples = () => (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-xl font-bold mb-4">Timer Hook</h2>
        <div className="text-center space-y-4">
          <Timer
            duration={timerDuration}
            format="mm:ss"
            size="lg"
            onComplete={() => alert('Timer completato!')}
          />
          <div className="flex space-x-2">
            <Button onClick={() => setTimerDuration(180)}>3 min</Button>
            <Button onClick={() => setTimerDuration(300)}>5 min</Button>
            <Button onClick={() => setTimerDuration(600)}>10 min</Button>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-xl font-bold mb-4">Countdown Hook</h2>
        <div className="text-center space-y-2">
          <p className="text-2xl font-bold">{countdown.formatted.humanReadable}</p>
          <p className="text-sm text-gray-500">fino al 2025</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-lg font-bold">{countdown.days}</p>
              <p className="text-xs">Giorni</p>
            </div>
            <div>
              <p className="text-lg font-bold">{countdown.hours}</p>
              <p className="text-xs">Ore</p>
            </div>
            <div>
              <p className="text-lg font-bold">{countdown.minutes}</p>
              <p className="text-xs">Minuti</p>
            </div>
            <div>
              <p className="text-lg font-bold">{countdown.seconds}</p>
              <p className="text-xs">Secondi</p>
            </div>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-xl font-bold mb-4">Progress Hook</h2>
        <div className="space-y-3">
          <ProgressBar value={65} label="Peso" showLabel />
          <ProgressBar value={40} label="Grasso Corporeo" variant="warning" showLabel />
          <ProgressBar value={80} label="Allenamenti" variant="success" showLabel />
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'ui': return renderUIComponents();
      case 'navigation': return renderNavigationComponents();
      case 'users': return renderUserComponents();
      case 'hooks': return renderHooksExamples();
      default: return renderUIComponents();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Component Showcase
          </h1>
          <p className="text-gray-600">
            Demo dei nuovi componenti modulari
          </p>
        </div>

        <div className="mb-6">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            fixed={false}
          />
        </div>

        <div className="pb-20">
          {renderContent()}
        </div>
      </div>

      {/* Performance info */}
      <div className="fixed bottom-4 right-4">
        <Card padding="sm" className="text-xs">
          <p><strong>Bundle:</strong> Modular</p>
          <p><strong>Components:</strong> {tabs.length} sections</p>
          <p><strong>Status:</strong> ✅ Ready</p>
        </Card>
      </div>
    </div>
  );
};

export default ComponentShowcase;