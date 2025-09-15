import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../../../components/ui';

const RescueBreathing = ({
  isOpen = false,
  onClose,
  onComplete,
  className = ''
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('prepare'); // prepare, inhale, hold, exhale
  const [phaseTime, setPhaseTime] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState('inhale');

  // Emergency breathing pattern: 4-7-8 (highly effective for anxiety)
  const phases = {
    inhale: 4,
    hold: 7,
    exhale: 8
  };

  useEffect(() => {
    if (!isActive || currentPhase === 'prepare') return;

    const timer = setInterval(() => {
      setPhaseTime(prev => {
        const currentPhaseDuration = phases[breathingPhase];

        if (prev >= currentPhaseDuration - 1) {
          // Move to next breathing phase
          let nextPhase;
          switch (breathingPhase) {
            case 'inhale':
              nextPhase = 'hold';
              break;
            case 'hold':
              nextPhase = 'exhale';
              break;
            case 'exhale':
              nextPhase = 'inhale';
              setCycleCount(count => {
                const newCount = count + 1;
                if (newCount >= 4) {
                  // Complete after 4 cycles (about 1 minute)
                  setIsActive(false);
                  setCurrentPhase('completed');
                  onComplete && onComplete({
                    type: 'rescue',
                    cycles: newCount,
                    completedAt: new Date()
                  });
                }
                return newCount;
              });
              break;
          }
          setBreathingPhase(nextPhase);
          return 0;
        }

        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, currentPhase, breathingPhase, onComplete]);

  useEffect(() => {
    if (isOpen) {
      setCurrentPhase('prepare');
      setIsActive(false);
      setPhaseTime(0);
      setCycleCount(0);
      setBreathingPhase('inhale');
    }
  }, [isOpen]);

  const handleStart = () => {
    setCurrentPhase('breathing');
    setIsActive(true);
    setPhaseTime(0);
    setCycleCount(0);
    setBreathingPhase('inhale');
  };

  const handleClose = () => {
    setIsActive(false);
    setCurrentPhase('prepare');
    onClose && onClose();
  };

  const getPhaseInstruction = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'Inspira dal naso';
      case 'hold':
        return 'Trattieni il respiro';
      case 'exhale':
        return 'Espira dalla bocca';
      default:
        return 'Preparati';
    }
  };

  const getPhaseIcon = () => {
    switch (breathingPhase) {
      case 'inhale':
        return '🌬️';
      case 'hold':
        return '⏸️';
      case 'exhale':
        return '💨';
      default:
        return '😌';
    }
  };

  const getPhaseColor = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'text-blue-600 bg-blue-50 border-blue-300';
      case 'hold':
        return 'text-purple-600 bg-purple-50 border-purple-300';
      case 'exhale':
        return 'text-green-600 bg-green-50 border-green-300';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-300';
    }
  };

  const getProgress = () => {
    const currentPhaseDuration = phases[breathingPhase];
    return currentPhaseDuration > 0 ? ((phaseTime + 1) / currentPhaseDuration) * 100 : 0;
  };

  if (currentPhase === 'prepare') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="md"
        className={className}
      >
        <div className="text-center p-6">
          <div className="text-4xl mb-4">🆘</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Respirazione di Emergenza
          </h2>
          <p className="text-slate-600 mb-6">
            Tecnica 4-7-8 per calmare ansia e stress in modo rapido ed efficace.
            Bastano 4 cicli (circa 1 minuto) per sentire i benefici.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-amber-800 mb-2">Come funziona:</h3>
            <div className="text-sm text-amber-700 space-y-1 text-left">
              <div>• <strong>4 secondi:</strong> Inspira dal naso</div>
              <div>• <strong>7 secondi:</strong> Trattieni il respiro</div>
              <div>• <strong>8 secondi:</strong> Espira dalla bocca</div>
              <div>• <strong>Ripeti 4 volte</strong> per effetto immediato</div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleStart}
            >
              🌬️ Inizia Subito
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="w-full"
              onClick={handleClose}
            >
              Chiudi
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (currentPhase === 'breathing') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="md"
        className={className}
      >
        <div className="text-center p-6">
          <div className="mb-4">
            <div className="text-sm text-slate-500 mb-2">
              Ciclo {cycleCount + 1} di 4
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((cycleCount) / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Phase Display */}
          <div className={`p-8 rounded-lg border-2 mb-6 ${getPhaseColor()}`}>
            <div className="text-5xl mb-4">{getPhaseIcon()}</div>
            <h3 className="text-2xl font-bold mb-3">{getPhaseInstruction()}</h3>

            {/* Countdown */}
            <div className="text-4xl font-bold mb-4">
              {phases[breathingPhase] - phaseTime}
            </div>

            {/* Phase Progress */}
            <div className="w-full bg-white/50 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all duration-1000"
                style={{
                  width: `${getProgress()}%`,
                  backgroundColor: 'currentColor',
                  opacity: 0.8
                }}
              />
            </div>
          </div>

          {/* Breathing Animation */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-32 h-32 rounded-full border-4 transition-all duration-1000 ${
                breathingPhase === 'inhale' ? 'scale-125 border-blue-400 bg-blue-100' :
                breathingPhase === 'hold' ? 'scale-125 border-purple-400 bg-purple-100' :
                'scale-75 border-green-400 bg-green-100'
              }`}
            />
          </div>

          {/* Emergency Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="text-xs text-blue-700">
              💡 <strong>Consiglio:</strong> Concentrati solo sul conteggio.
              È normale sentirsi leggermente storditi all'inizio.
            </div>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={handleClose}
          >
            Interrompi
          </Button>
        </div>
      </Modal>
    );
  }

  if (currentPhase === 'completed') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="md"
        className={className}
      >
        <div className="text-center p-6">
          <div className="text-4xl mb-4">✨</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Sessione Completata!
          </h2>
          <p className="text-slate-600 mb-6">
            Hai completato 4 cicli di respirazione 4-7-8.
            Dovresti già sentire una riduzione di ansia e stress.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">
              Benefici Immediati:
            </h3>
            <div className="text-sm text-green-700 space-y-1">
              <div>• Sistema nervoso più calmo</div>
              <div>• Riduzione dell'ansia</div>
              <div>• Migliore controllo emotivo</div>
              <div>• Mente più chiara e focale</div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                setCurrentPhase('prepare');
                setIsActive(false);
                setPhaseTime(0);
                setCycleCount(0);
                setBreathingPhase('inhale');
              }}
            >
              Ripeti Sessione
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="w-full"
              onClick={handleClose}
            >
              Chiudi
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return null;
};

export default RescueBreathing;