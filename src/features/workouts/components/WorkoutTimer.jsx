import React, { useState, useEffect, useRef } from 'react';
import { Card, Button } from '../../../components/ui';
import { formatDuration } from '../../../utils/dateTime';

const WorkoutTimer = ({
  className = '',
  autoStart = false,
  onTimeChange,
  size = 'lg'
}) => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(autoStart);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          if (onTimeChange) {
            onTimeChange(newTime);
          }
          return newTime;
        });
      }, 1000);
    } else if (!isActive && time !== 0) {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, time, onTimeChange]);

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleReset = () => {
    setTime(0);
    setIsActive(false);
    if (onTimeChange) {
      onTimeChange(0);
    }
  };

  const sizeClasses = {
    sm: {
      container: 'p-3',
      title: 'text-sm font-medium',
      timer: 'text-2xl',
      buttons: 'text-xs px-3 py-1'
    },
    md: {
      container: 'p-4',
      title: 'text-base font-semibold',
      timer: 'text-3xl',
      buttons: 'text-sm px-4 py-2'
    },
    lg: {
      container: 'p-6',
      title: 'text-lg font-bold',
      timer: 'text-5xl',
      buttons: 'text-base px-4 py-2'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <Card
      glass
      padding="none"
      className={`${currentSize.container} text-center ${className}`}
    >
      <h3 className={`${currentSize.title} text-slate-700 mb-2`}>
        Timer di Recupero
      </h3>

      <div className={`${currentSize.timer} font-mono font-bold text-slate-800 mb-3`}>
        {formatDuration(time, 'mm:ss')}
      </div>

      <div className="flex justify-center space-x-3">
        <Button
          variant={isActive ? 'warning' : 'success'}
          size={size === 'lg' ? 'md' : 'sm'}
          onClick={isActive ? handlePause : handleStart}
          className={currentSize.buttons}
        >
          {isActive ? 'Pausa' : 'Avvia'}
        </Button>

        <Button
          variant="danger"
          size={size === 'lg' ? 'md' : 'sm'}
          onClick={handleReset}
          className={currentSize.buttons}
        >
          Reset
        </Button>
      </div>

      {/* Quick Timer Buttons */}
      {size === 'lg' && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-xs text-slate-600 mb-2">Quick Set:</p>
          <div className="flex justify-center space-x-2">
            {[30, 60, 90, 120].map(seconds => (
              <Button
                key={seconds}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTime(seconds);
                  setIsActive(false);
                  if (onTimeChange) onTimeChange(seconds);
                }}
                className="text-xs px-2 py-1"
              >
                {seconds}s
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Timer Stats */}
      {time > 0 && (
        <div className="mt-3 text-xs text-slate-500">
          {isActive ? '⏱️ Timer attivo' : '⏸️ Timer in pausa'}
        </div>
      )}
    </Card>
  );
};

export default WorkoutTimer;