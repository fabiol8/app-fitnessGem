import React, { useState, useEffect, useRef } from 'react';
import Button from '../Button';

const Timer = ({
  duration,
  autoStart = false,
  onComplete,
  onTick,
  format = 'mm:ss',
  className = '',
  showControls = true,
  size = 'md'
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(duration);
    setIsCompleted(false);
  }, [duration]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;

          if (onTick) {
            onTick(newTime);
          }

          if (newTime <= 0) {
            setIsRunning(false);
            setIsCompleted(true);
            if (onComplete) {
              onComplete();
            }
          }

          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, onComplete, onTick]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    switch (format) {
      case 'mm:ss':
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      case 'm:ss':
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      case 'seconds':
        return seconds.toString();
      default:
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
    setIsCompleted(false);
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  const sizes = {
    sm: {
      container: 'w-24 h-24',
      text: 'text-lg',
      buttons: 'text-xs'
    },
    md: {
      container: 'w-32 h-32',
      text: 'text-2xl',
      buttons: 'text-sm'
    },
    lg: {
      container: 'w-48 h-48',
      text: 'text-4xl',
      buttons: 'text-base'
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Circular Timer */}
      <div className={`relative ${sizes[size].container}`}>
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200"
          />
          {/* Progress Circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className={`transition-all duration-1000 ${
              isCompleted ? 'text-green-500' :
              timeLeft <= 10 ? 'text-red-500' :
              'text-blue-500'
            }`}
          />
        </svg>

        {/* Timer Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-mono font-bold ${sizes[size].text} ${
            isCompleted ? 'text-green-600' :
            timeLeft <= 10 ? 'text-red-600' :
            'text-gray-800'
          }`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex space-x-2">
          {!isRunning ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleStart}
              disabled={isCompleted || timeLeft <= 0}
              className={sizes[size].buttons}
            >
              {timeLeft === duration ? 'Start' : 'Resume'}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePause}
              className={sizes[size].buttons}
            >
              Pause
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className={sizes[size].buttons}
          >
            Reset
          </Button>
        </div>
      )}

      {/* Status */}
      {isCompleted && (
        <div className="text-green-600 font-medium">
          Timer Completed! 🎉
        </div>
      )}
    </div>
  );
};

export default Timer;