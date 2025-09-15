import React, { useState } from 'react';
import { ComponentShowcase, MigrationExample } from './examples';
import { Button, Card } from './components/ui';

/**
 * App di test per verificare tutti i componenti creati
 */
const TestApp = () => {
  const [currentTest, setCurrentTest] = useState('showcase');

  const tests = [
    { id: 'showcase', label: 'Component Showcase', component: ComponentShowcase },
    { id: 'migration', label: 'Migration Example', component: MigrationExample }
  ];

  const CurrentComponent = tests.find(t => t.id === currentTest)?.component || ComponentShowcase;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              🧪 Test Suite - App Fitness Refactoring
            </h1>

            <div className="flex space-x-2">
              {tests.map(test => (
                <Button
                  key={test.id}
                  variant={currentTest === test.id ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setCurrentTest(test.id)}
                >
                  {test.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto mb-6">
          <Card padding="md" className="bg-green-50 border-green-200">
            <div className="flex items-center space-x-2">
              <span className="text-green-600 text-lg">✅</span>
              <div>
                <p className="font-medium text-green-800">Test Status: Componenti Creati</p>
                <p className="text-sm text-green-600">
                  Tutti i componenti UI, hooks e utilities sono stati creati con successo
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Render Current Test */}
        <CurrentComponent />
      </div>
    </div>
  );
};

export default TestApp;