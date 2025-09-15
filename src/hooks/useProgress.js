import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from './useFirestore';
import { usePersistentState } from './usePersistentState';

export const useProgress = (userId, options = {}) => {
  const {
    enableLocalFallback = true,
    autoSync = true
  } = options;

  const today = new Date().toISOString().split('T')[0];

  // Firestore for cloud sync
  const {
    data: cloudProgress,
    loading: cloudLoading,
    updateData: updateCloudProgress,
    isConnected
  } = useFirestore(`users/${userId}/progress`, today, {
    defaultValue: {},
    enableRealtime: autoSync
  });

  // Local storage fallback
  const [localProgress, setLocalProgress] = usePersistentState(
    `progress_${userId}_${today}`,
    {},
    { syncAcrossTabs: true }
  );

  // Current progress data
  const progress = useMemo(() => {
    if (isConnected && cloudProgress) {
      return cloudProgress;
    }
    return enableLocalFallback ? localProgress : {};
  }, [cloudProgress, localProgress, isConnected, enableLocalFallback]);

  const updateProgress = async (newData, merge = true) => {
    const updatedData = merge ? { ...progress, ...newData } : newData;

    // Always update local storage
    if (enableLocalFallback) {
      setLocalProgress(updatedData);
    }

    // Try to update cloud if connected
    if (isConnected) {
      const success = await updateCloudProgress(updatedData, merge);
      if (!success && enableLocalFallback) {
        // Cloud failed, keep local data
        console.warn('Cloud sync failed, data saved locally');
      }
      return success;
    }

    return true; // Local update always succeeds
  };

  // Sync local to cloud when connection is restored
  useEffect(() => {
    if (isConnected && enableLocalFallback && localProgress && Object.keys(localProgress).length > 0) {
      // Check if local data is newer than cloud data
      const localTimestamp = localProgress.updatedAt;
      const cloudTimestamp = cloudProgress?.updatedAt;

      if (!cloudTimestamp || (localTimestamp && localTimestamp > cloudTimestamp)) {
        updateCloudProgress(localProgress);
      }
    }
  }, [isConnected, localProgress, cloudProgress, updateCloudProgress, enableLocalFallback]);

  return {
    progress,
    loading: cloudLoading,
    updateProgress,
    isOnline: isConnected,
    hasLocalData: enableLocalFallback && Object.keys(localProgress).length > 0
  };
};

export const useWeeklyMeasurements = (userId) => {
  const {
    data: measurements,
    loading,
    updateData: updateMeasurements,
    isConnected
  } = useFirestore(`users/${userId}/measurements`, 'weekly', {
    defaultValue: {},
    enableRealtime: true
  });

  const addMeasurement = async (date, measurementData) => {
    const newMeasurements = {
      ...measurements,
      [date]: {
        ...measurementData,
        date,
        createdAt: Date.now()
      }
    };

    return await updateMeasurements(newMeasurements);
  };

  const getMeasurement = (date) => {
    return measurements?.[date] || null;
  };

  const getLatestMeasurement = () => {
    if (!measurements) return null;

    const dates = Object.keys(measurements).sort((a, b) => new Date(b) - new Date(a));
    return dates.length > 0 ? measurements[dates[0]] : null;
  };

  const getMeasurementHistory = (limit = 10) => {
    if (!measurements) return [];

    return Object.values(measurements)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  };

  return {
    measurements: measurements || {},
    loading,
    addMeasurement,
    getMeasurement,
    getLatestMeasurement,
    getMeasurementHistory,
    isOnline: isConnected
  };
};

export default useProgress;