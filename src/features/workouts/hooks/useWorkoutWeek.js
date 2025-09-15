import { useState, useEffect, useMemo } from 'react';

/**
 * Hook per gestione settimana di allenamento
 */
export const useWorkoutWeek = (startDate) => {
  const [weekNumber, setWeekNumber] = useState(1);

  useEffect(() => {
    if (!startDate) return;

    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setWeekNumber(Math.ceil(diffDays / 7));
  }, [startDate]);

  // Calcola i giorni della settimana corrente (Lunedì-Domenica)
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);

    // Calcola il lunedì della settimana corrente
    monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  const getCurrentDay = () => {
    const today = new Date();
    return weekDays.find(day =>
      day.toDateString() === today.toDateString()
    );
  };

  const getTodayIndex = () => {
    const today = new Date();
    return weekDays.findIndex(day =>
      day.toDateString() === today.toDateString()
    );
  };

  return {
    weekNumber,
    weekDays,
    currentDay: getCurrentDay(),
    todayIndex: getTodayIndex(),
    isToday: (date) => {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }
  };
};

/**
 * Hook per gestione stato workout
 */
export const useWorkoutProgress = (userId, initialProgress = {}) => {
  const [progress, setProgress] = useState(initialProgress);

  const updateProgress = (key, value) => {
    setProgress(prev => ({
      ...prev,
      [key]: value
    }));

    // TODO: Sync to Firestore
    // saveProgressToFirestore(userId, key, value);
  };

  const getExerciseProgress = (baseId) => {
    const completedId = `${baseId}_completed`;
    const weightId = `${baseId}_weight`;
    const repsId = `${baseId}_reps`;
    const levelId = `${baseId}_level`;

    return {
      isCompleted: !!progress[completedId],
      weight: progress[weightId] || '',
      reps: progress[repsId] || '',
      level: progress[levelId] || '',
      sets: Object.keys(progress)
        .filter(key => key.startsWith(`${baseId}_set_`))
        .map(key => !!progress[key])
    };
  };

  const getDayStats = (dayName) => {
    const dayProgressKeys = Object.keys(progress).filter(key =>
      key.includes(`workout_${dayName}`)
    );

    const completedExercises = dayProgressKeys.filter(key =>
      key.endsWith('_completed') && progress[key]
    );

    return {
      totalKeys: dayProgressKeys.length,
      completedExercises: completedExercises.length,
      completionRate: dayProgressKeys.length > 0
        ? (completedExercises.length / dayProgressKeys.length) * 100
        : 0
    };
  };

  const getWeekStats = () => {
    const allCompletedExercises = Object.keys(progress).filter(key =>
      key.includes('workout_') && key.endsWith('_completed') && progress[key]
    );

    const totalCalories = allCompletedExercises.reduce((total, key) => {
      // Extract exercise info from key to get calories
      // This would need to be enhanced with actual exercise data
      return total + 50; // Placeholder calories per exercise
    }, 0);

    return {
      completedExercises: allCompletedExercises.length,
      totalCalories,
      activeDays: new Set(
        allCompletedExercises.map(key => {
          const match = key.match(/workout_([A-Z]+)_/);
          return match ? match[1] : null;
        }).filter(Boolean)
      ).size
    };
  };

  return {
    progress,
    updateProgress,
    getExerciseProgress,
    getDayStats,
    getWeekStats
  };
};

export default useWorkoutWeek;