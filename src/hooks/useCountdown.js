import { useState, useEffect, useMemo } from 'react';

export const useCountdown = (targetDate, options = {}) => {
  const {
    interval = 1000,
    onComplete,
    autoStart = true
  } = options;

  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(autoStart);

  // Calculate initial time left
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      return Math.max(0, target - now);
    };

    setTimeLeft(calculateTimeLeft());
  }, [targetDate]);

  // Countdown interval
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = Math.max(0, prevTime - interval);

        if (newTime === 0 && onComplete) {
          onComplete();
        }

        return newTime;
      });
    }, interval);

    return () => clearInterval(intervalId);
  }, [isActive, timeLeft, interval, onComplete]);

  const formattedTime = useMemo(() => {
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      total: timeLeft,
      formatted: {
        full: `${days}d ${hours}h ${minutes}m ${seconds}s`,
        compact: `${days}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        humanReadable: days > 0 ? `${days} giorni` : hours > 0 ? `${hours} ore` : minutes > 0 ? `${minutes} minuti` : `${seconds} secondi`
      }
    };
  }, [timeLeft]);

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);
  const reset = () => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    setTimeLeft(Math.max(0, target - now));
    setIsActive(autoStart);
  };

  return {
    ...formattedTime,
    isActive,
    isCompleted: timeLeft === 0,
    start,
    pause,
    reset
  };
};

export const useDaysUntilNextMonday = () => {
  const [daysUntil, setDaysUntil] = useState(0);

  useEffect(() => {
    const calculateDaysUntilNextMonday = () => {
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

      let daysUntilMonday;
      if (currentDay === 0) { // Sunday
        daysUntilMonday = 1;
      } else if (currentDay === 1) { // Monday
        daysUntilMonday = 7; // Next Monday
      } else {
        daysUntilMonday = 8 - currentDay; // Days until next Monday
      }

      return daysUntilMonday;
    };

    const updateDaysUntil = () => {
      setDaysUntil(calculateDaysUntilNextMonday());
    };

    updateDaysUntil();

    // Update at midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      updateDaysUntil();

      // Then update every 24 hours
      const intervalId = setInterval(updateDaysUntil, 24 * 60 * 60 * 1000);

      return () => clearInterval(intervalId);
    }, msUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, []);

  return daysUntil;
};

export const useTimer = (initialDuration, options = {}) => {
  const {
    autoStart = false,
    onComplete,
    onTick
  } = options;

  const [duration, setDuration] = useState(initialDuration);
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setTimeLeft(duration);
    setIsCompleted(false);
  }, [duration]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const intervalId = setInterval(() => {
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

        return Math.max(0, newTime);
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft, onComplete, onTick]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
    setIsCompleted(false);
  };
  const setNewDuration = (newDuration) => {
    setDuration(newDuration);
    if (!isRunning) {
      setTimeLeft(newDuration);
    }
  };

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  return {
    timeLeft,
    duration,
    progress,
    isRunning,
    isCompleted,
    start,
    pause,
    reset,
    setDuration: setNewDuration
  };
};

export default useCountdown;