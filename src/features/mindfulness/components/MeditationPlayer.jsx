import React, { useState, useEffect } from 'react';
import { Card, Button, Timer } from '../../../components/ui';

const MeditationPlayer = ({
  isActive = false,
  onComplete,
  className = ''
}) => {
  const [selectedDuration, setSelectedDuration] = useState(300); // 5 minutes default
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [phase, setPhase] = useState('setup'); // setup, playing, completed

  const durations = [
    { value: 180, label: '3 min', description: 'Quick reset' },
    { value: 300, label: '5 min', description: 'Standard' },
    { value: 600, label: '10 min', description: 'Deep focus' },
    { value: 900, label: '15 min', description: 'Extended' },
    { value: 1200, label: '20 min', description: 'Full session' }
  ];

  const techniques = [
    {
      id: 'breathing',
      name: 'Respirazione Consapevole',
      icon: '🌬️',
      description: 'Concentrati sul respiro naturale',
      instructions: 'Inspira ed espira naturalmente, porta attenzione al flusso del respiro'
    },
    {
      id: 'body-scan',
      name: 'Scansione Corporea',
      icon: '🧘',
      description: 'Rilassa ogni parte del corpo',
      instructions: 'Parti dalla testa e scendi lentamente, rilassando ogni muscolo'
    },
    {
      id: 'mindfulness',
      name: 'Presenza Mentale',
      icon: '🎯',
      description: 'Osserva pensieri senza giudizio',
      instructions: 'Nota i pensieri che arrivano e lasciali andare con gentilezza'
    }
  ];

  const [selectedTechnique, setSelectedTechnique] = useState(techniques[0]);

  useEffect(() => {
    let interval;
    if (isPlaying && currentTime < selectedDuration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= selectedDuration) {
            setIsPlaying(false);
            setPhase('completed');
            onComplete && onComplete({
              duration: selectedDuration,
              technique: selectedTechnique.id,
              completedAt: new Date()
            });
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, selectedDuration, selectedTechnique, onComplete]);

  const handleStart = () => {
    setPhase('playing');
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const handlePause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setPhase('setup');
  };

  const handleReset = () => {
    setPhase('setup');
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return selectedDuration > 0 ? (currentTime / selectedDuration) * 100 : 0;
  };

  if (phase === 'setup') {
    return (
      <Card glass padding="lg" className={className}>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            🧘‍♀️ Meditazione Guidata
          </h3>
          <p className="text-sm text-slate-500">
            Scegli durata e tecnica per iniziare
          </p>
        </div>

        {/* Duration Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-600 mb-3">Durata</h4>
          <div className="grid grid-cols-3 gap-2">
            {durations.map((duration) => (
              <Button
                key={duration.value}
                variant={selectedDuration === duration.value ? 'primary' : 'ghost'}
                size="sm"
                className="text-center p-3"
                onClick={() => setSelectedDuration(duration.value)}
              >
                <div>
                  <div className="font-semibold">{duration.label}</div>
                  <div className="text-xs opacity-75">{duration.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Technique Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-600 mb-3">Tecnica</h4>
          <div className="space-y-2">
            {techniques.map((technique) => (
              <Button
                key={technique.id}
                variant={selectedTechnique.id === technique.id ? 'primary' : 'ghost'}
                className="w-full text-left p-3"
                onClick={() => setSelectedTechnique(technique)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{technique.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{technique.name}</div>
                    <div className="text-xs opacity-75">{technique.description}</div>
                  </div>
                </div>
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
          Inizia Meditazione ({formatTime(selectedDuration)})
        </Button>
      </Card>
    );
  }

  if (phase === 'playing') {
    return (
      <Card glass padding="lg" className={className}>
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            {selectedTechnique.name}
          </h3>
          <p className="text-sm text-slate-500">
            {selectedTechnique.instructions}
          </p>
        </div>

        {/* Timer Display */}
        <div className="flex justify-center mb-6">
          <Timer
            size="large"
            progress={getProgress()}
            className="w-48 h-48"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-700">
                {formatTime(selectedDuration - currentTime)}
              </div>
              <div className="text-sm text-slate-500">rimanenti</div>
            </div>
          </Timer>
        </div>

        {/* Breathing Guidance (for breathing technique) */}
        {selectedTechnique.id === 'breathing' && (
          <div className="text-center mb-6">
            <div className="text-lg text-slate-600 mb-2">
              {Math.floor(currentTime / 4) % 2 === 0 ? '🌬️ Inspira' : '💨 Espira'}
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${((currentTime % 4) / 4) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePause}
          >
            {isPlaying ? '⏸️ Pausa' : '▶️ Riprendi'}
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={handleStop}
          >
            ⏹️ Stop
          </Button>
        </div>
      </Card>
    );
  }

  if (phase === 'completed') {
    return (
      <Card glass padding="lg" className={className}>
        <div className="text-center">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            Meditazione Completata!
          </h3>
          <p className="text-slate-600 mb-4">
            Hai meditato per {formatTime(selectedDuration)} con la tecnica "{selectedTechnique.name}"
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="text-green-800 font-medium mb-2">Benefici ottenuti:</div>
            <div className="text-sm text-green-700 space-y-1">
              <div>• Riduzione dello stress e dell'ansia</div>
              <div>• Miglioramento della concentrazione</div>
              <div>• Maggiore consapevolezza corporea</div>
              <div>• Rilassamento mentale e fisico</div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleReset}
            >
              Nuova Meditazione
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="w-full"
              onClick={() => {
                // Navigate back or close
                console.log('Close meditation player');
              }}
            >
              Chiudi
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};

export default MeditationPlayer;