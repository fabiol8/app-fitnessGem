import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../../components/ui';

const BreathingTimer = ({
  isActive = false,
  onComplete,
  className = ''
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('inhale'); // inhale, hold, exhale, pause
  const [phaseTime, setPhaseTime] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);
  const [targetCycles, setTargetCycles] = useState(10);

  // Breathing patterns
  const patterns = [
    {
      id: 'basic',
      name: 'Respirazione Base',
      description: '4-4-4-4 (Quadrata)',
      icon: '⬜',
      phases: {
        inhale: 4,
        hold: 4,
        exhale: 4,
        pause: 4
      }
    },
    {
      id: 'calming',
      name: 'Rilassamento',
      description: '4-7-8 (Calmante)',
      icon: '😌',
      phases: {
        inhale: 4,
        hold: 7,
        exhale: 8,
        pause: 0
      }
    },
    {
      id: 'energizing',
      name: 'Energizzante',
      description: '6-2-6-2 (Attivante)',
      icon: '⚡',
      phases: {
        inhale: 6,
        hold: 2,
        exhale: 6,
        pause: 2
      }
    },
    {
      id: 'focus',
      name: 'Concentrazione',
      description: '5-5-5-5 (Equilibrio)',
      icon: '🎯',
      phases: {
        inhale: 5,
        hold: 5,
        exhale: 5,
        pause: 5
      }
    }
  ];

  const [selectedPattern, setSelectedPattern] = useState(patterns[0]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setPhaseTime(prev => {
        const currentPhaseDuration = selectedPattern.phases[currentPhase];

        if (prev >= currentPhaseDuration - 1) {
          // Move to next phase
          let nextPhase;
          switch (currentPhase) {
            case 'inhale':
              nextPhase = selectedPattern.phases.hold > 0 ? 'hold' : 'exhale';
              break;
            case 'hold':
              nextPhase = 'exhale';
              break;
            case 'exhale':
              nextPhase = selectedPattern.phases.pause > 0 ? 'pause' : 'inhale';
              break;
            case 'pause':
              nextPhase = 'inhale';
              setTotalCycles(cycles => {
                const newCycles = cycles + 1;
                if (newCycles >= targetCycles) {
                  setIsRunning(false);
                  onComplete && onComplete({
                    pattern: selectedPattern.id,
                    cycles: newCycles,
                    completedAt: new Date()
                  });
                }
                return newCycles;
              });
              break;
            default:
              nextPhase = 'inhale';
          }
          setCurrentPhase(nextPhase);
          return 0;
        }

        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, currentPhase, selectedPattern, targetCycles, onComplete]);

  const handleStart = () => {
    setIsRunning(true);
    setCurrentPhase('inhale');
    setPhaseTime(0);
    setTotalCycles(0);
  };

  const handlePause = () => {
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);
    setCurrentPhase('inhale');
    setPhaseTime(0);
    setTotalCycles(0);
  };

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Inspira lentamente';
      case 'hold':
        return 'Trattieni il respiro';
      case 'exhale':
        return 'Espira completamente';
      case 'pause':
        return 'Pausa naturale';
      default:
        return 'Preparati';
    }
  };

  const getPhaseIcon = () => {
    switch (currentPhase) {
      case 'inhale':
        return '🌬️';
      case 'hold':
        return '⏸️';
      case 'exhale':
        return '💨';
      case 'pause':
        return '⏳';
      default:
        return '😌';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'hold':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'exhale':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pause':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getProgress = () => {
    const currentPhaseDuration = selectedPattern.phases[currentPhase];
    return currentPhaseDuration > 0 ? (phaseTime / currentPhaseDuration) * 100 : 0;
  };

  const getOverallProgress = () => {
    return targetCycles > 0 ? (totalCycles / targetCycles) * 100 : 0;
  };

  if (!isRunning && totalCycles === 0) {
    return (
      <Card glass padding="lg" className={className}>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            🌬️ Respirazione Guidata
          </h3>
          <p className="text-sm text-slate-500">
            Scegli pattern e durata per iniziare
          </p>
        </div>

        {/* Pattern Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-600 mb-3">Tecnica di Respirazione</h4>
          <div className="space-y-2">
            {patterns.map((pattern) => (
              <Button
                key={pattern.id}
                variant={selectedPattern.id === pattern.id ? 'primary' : 'ghost'}
                className="w-full text-left p-3"
                onClick={() => setSelectedPattern(pattern)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{pattern.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{pattern.name}</div>
                    <div className="text-xs opacity-75">{pattern.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Cycles Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-600 mb-3">Numero di Cicli</h4>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 20].map((cycles) => (
              <Button
                key={cycles}
                variant={targetCycles === cycles ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setTargetCycles(cycles)}
              >
                {cycles}
              </Button>
            ))}
          </div>
        </div>

        <Button
          variant="success"
          size="lg"
          className="w-full"
          onClick={handleStart}
        >
          Inizia Sessione ({targetCycles} cicli)
        </Button>
      </Card>
    );
  }

  return (
    <Card glass padding="lg" className={className}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-1">
          {selectedPattern.name}
        </h3>
        <p className="text-sm text-slate-500">
          Ciclo {totalCycles + 1} di {targetCycles}
        </p>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getOverallProgress()}%` }}
          />
        </div>
        <div className="text-xs text-center text-slate-500">
          Progresso Sessione: {Math.round(getOverallProgress())}%
        </div>
      </div>

      {/* Current Phase */}
      <div className={`p-6 rounded-lg border-2 mb-6 text-center ${getPhaseColor()}`}>
        <div className="text-4xl mb-3">{getPhaseIcon()}</div>
        <h4 className="text-xl font-semibold mb-2">{getPhaseInstruction()}</h4>

        {/* Phase Timer */}
        <div className="text-3xl font-bold mb-3">
          {selectedPattern.phases[currentPhase] - phaseTime}
        </div>

        {/* Phase Progress */}
        <div className="w-full bg-white/50 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-1000"
            style={{
              width: `${getProgress()}%`,
              backgroundColor: 'currentColor',
              opacity: 0.7
            }}
          />
        </div>
      </div>

      {/* Breathing Animation */}
      <div className="flex justify-center mb-6">
        <div
          className={`w-24 h-24 rounded-full border-4 transition-all duration-1000 ${
            currentPhase === 'inhale' ? 'scale-125 border-blue-400' :
            currentPhase === 'hold' ? 'scale-125 border-purple-400' :
            currentPhase === 'exhale' ? 'scale-75 border-green-400' :
            'scale-100 border-gray-400'
          }`}
          style={{
            backgroundColor: 'rgba(255,255,255,0.3)'
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={handlePause}
        >
          {isRunning ? '⏸️ Pausa' : '▶️ Riprendi'}
        </Button>
        <Button
          variant="danger"
          size="lg"
          onClick={handleStop}
        >
          ⏹️ Stop
        </Button>
      </div>

      {/* Pattern Info */}
      <div className="mt-6 pt-4 border-t border-white/20 text-center">
        <div className="text-xs text-slate-500">
          Pattern: {selectedPattern.description}
        </div>
      </div>
    </Card>
  );
};

export default BreathingTimer;