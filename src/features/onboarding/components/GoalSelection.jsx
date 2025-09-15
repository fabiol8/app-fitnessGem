import React, { useState } from 'react';
import { Button, Card, ProgressBar } from '../../../components/ui';
import AuthLayout from '../../auth/components/AuthLayout';

const GoalSelection = ({ onContinue, onBack }) => {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [primaryGoal, setPrimaryGoal] = useState('');

  const goals = [
    {
      id: 'lose_weight',
      title: 'Perdere Peso',
      description: 'Raggiungi il tuo peso forma ideale',
      icon: '⚖️',
      color: 'blue',
      benefits: ['Riduzione massa grassa', 'Miglioramento energia', 'Salute cardiovascolare']
    },
    {
      id: 'gain_muscle',
      title: 'Aumentare Massa Muscolare',
      description: 'Costruisci muscoli e forza',
      icon: '💪',
      color: 'green',
      benefits: ['Maggiore forza', 'Metabolismo accelerato', 'Tono muscolare']
    },
    {
      id: 'maintain_weight',
      title: 'Mantenere il Peso',
      description: 'Conserva il tuo peso attuale',
      icon: '⚖️',
      color: 'purple',
      benefits: ['Equilibrio nutrizionale', 'Stile di vita sano', 'Benessere generale']
    },
    {
      id: 'improve_fitness',
      title: 'Migliorare Fitness',
      description: 'Aumenta resistenza e energia',
      icon: '🏃‍♂️',
      color: 'orange',
      benefits: ['Resistenza cardiovascolare', 'Energia quotidiana', 'Vitalità']
    },
    {
      id: 'reduce_stress',
      title: 'Ridurre lo Stress',
      description: 'Trova equilibrio e tranquillità',
      icon: '🧘‍♀️',
      color: 'indigo',
      benefits: ['Rilassamento mentale', 'Sonno migliore', 'Equilibrio emotivo']
    },
    {
      id: 'healthy_habits',
      title: 'Creare Abitudini Sane',
      description: 'Sviluppa uno stile di vita equilibrato',
      icon: '🌱',
      color: 'green',
      benefits: ['Routine quotidiana', 'Disciplina personale', 'Longevità']
    }
  ];

  const handleGoalToggle = (goalId) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        // Remove goal
        const newGoals = prev.filter(id => id !== goalId);
        // If primary goal was removed, clear it
        if (primaryGoal === goalId) {
          setPrimaryGoal(newGoals[0] || '');
        }
        return newGoals;
      } else {
        // Add goal
        const newGoals = [...prev, goalId];
        // Set as primary if it's the first one
        if (!primaryGoal) {
          setPrimaryGoal(goalId);
        }
        return newGoals;
      }
    });
  };

  const handlePrimaryGoalSelect = (goalId) => {
    if (selectedGoals.includes(goalId)) {
      setPrimaryGoal(goalId);
    }
  };

  const handleContinue = () => {
    if (selectedGoals.length === 0) return;

    const goalData = {
      selectedGoals,
      primaryGoal,
      goalsDetails: goals.filter(goal => selectedGoals.includes(goal.id))
    };

    onContinue(goalData);
  };

  const progress = 33; // Step 2 of 3

  return (
    <AuthLayout
      title="I tuoi obiettivi"
      subtitle="Seleziona cosa vuoi raggiungere (puoi sceglierne più di uno)"
      showLogo={false}
    >
      <div className="space-y-6">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Passo 2 di 3</span>
            <span>{progress}% completato</span>
          </div>
          <ProgressBar value={progress} variant="primary" size="sm" />
        </div>

        {/* Goals Grid */}
        <div className="space-y-3">
          {goals.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            const isPrimary = primaryGoal === goal.id;

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white/50 hover:border-gray-300'
                }`}
                onClick={() => handleGoalToggle(goal.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{goal.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {goal.title}
                      </h3>
                      {isSelected && (
                        <div className="flex items-center space-x-2">
                          {isPrimary && (
                            <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                              Principale
                            </span>
                          )}
                          <span className="text-blue-600 text-lg">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs mt-1">
                      {goal.description}
                    </p>

                    {/* Benefits */}
                    {isSelected && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {goal.benefits.map((benefit, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Goal Selection */}
                {isSelected && !isPrimary && selectedGoals.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrimaryGoalSelect(goal.id);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-xs underline"
                    >
                      Imposta come obiettivo principale
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Goals Summary */}
        {selectedGoals.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="font-medium text-green-900 text-sm mb-2">
              Obiettivi selezionati ({selectedGoals.length})
            </h4>
            <div className="space-y-1">
              {selectedGoals.map(goalId => {
                const goal = goals.find(g => g.id === goalId);
                return (
                  <div key={goalId} className="flex items-center justify-between text-sm">
                    <span className="text-green-700">
                      {goal.icon} {goal.title}
                    </span>
                    {goalId === primaryGoal && (
                      <span className="text-xs text-green-600 font-medium">Principale</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 text-lg">💡</span>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Suggerimento</p>
              <p>
                Scegli obiettivi realistici e specifici. L'app adatterà automaticamente
                i contenuti e i consigli in base alle tue selezioni.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={onBack}
          >
            ← Indietro
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handleContinue}
            disabled={selectedGoals.length === 0}
          >
            Continua →
          </Button>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <button
            onClick={() => onContinue({ selectedGoals: ['healthy_habits'], primaryGoal: 'healthy_habits' })}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Salta questo passo
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default GoalSelection;