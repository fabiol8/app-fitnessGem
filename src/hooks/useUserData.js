import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from './useFirestore';
import { usePersistentState } from './usePersistentState';

// Default user configuration
const DEFAULT_USER_CONFIG = {
  name: '',
  startDate: '',
  endDate: '',
  startWeight: 0,
  goalWeight: 0,
  intermediateGoalWeight: 0,
  height: 0,
  startMeasurements: {
    weight: 0,
    bodyFat: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    arms: 0,
    neck: 0
  },
  goalMeasurements: {
    weight: 0,
    bodyFat: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    arms: 0,
    neck: 0
  },
  preferences: {
    units: 'metric', // metric or imperial
    theme: 'light',
    notifications: true,
    privacy: 'private'
  },
  createdAt: null,
  updatedAt: null
};

export const useUserData = (userId, options = {}) => {
  const {
    enableLocalFallback = true,
    autoSync = true
  } = options;

  // Cloud data
  const {
    data: cloudUser,
    loading: cloudLoading,
    updateData: updateCloudUser,
    isConnected
  } = useFirestore('users', userId, {
    defaultValue: DEFAULT_USER_CONFIG,
    enableRealtime: autoSync
  });

  // Local fallback
  const [localUser, setLocalUser] = usePersistentState(
    `user_${userId}`,
    DEFAULT_USER_CONFIG,
    { syncAcrossTabs: true }
  );

  // Current user data
  const userData = useMemo(() => {
    if (isConnected && cloudUser) {
      return { ...DEFAULT_USER_CONFIG, ...cloudUser };
    }
    return enableLocalFallback ? { ...DEFAULT_USER_CONFIG, ...localUser } : DEFAULT_USER_CONFIG;
  }, [cloudUser, localUser, isConnected, enableLocalFallback]);

  // Calculated fields
  const calculatedData = useMemo(() => {
    const { startDate, endDate, startWeight, goalWeight, intermediateGoalWeight, height } = userData;

    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate) : null;
    const now = new Date();

    const durationWeeks = startDateObj && endDateObj
      ? Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24 * 7))
      : 0;

    const weeksElapsed = startDateObj
      ? Math.floor((now - startDateObj) / (1000 * 60 * 60 * 24 * 7))
      : 0;

    const weeksRemaining = Math.max(0, durationWeeks - weeksElapsed);

    const totalWeightLoss = startWeight - goalWeight;
    const weeklyWeightLossTarget = durationWeeks > 0 ? totalWeightLoss / durationWeeks : 0;

    const progressPercentage = durationWeeks > 0 ? (weeksElapsed / durationWeeks) * 100 : 0;

    const currentBMI = height > 0 ? userData.startMeasurements.weight / Math.pow(height / 100, 2) : 0;
    const goalBMI = height > 0 ? goalWeight / Math.pow(height / 100, 2) : 0;

    return {
      durationWeeks,
      weeksElapsed,
      weeksRemaining,
      totalWeightLoss,
      weeklyWeightLossTarget,
      progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
      currentBMI: Math.round(currentBMI * 10) / 10,
      goalBMI: Math.round(goalBMI * 10) / 10,
      isGoalReached: progressPercentage >= 100
    };
  }, [userData]);

  const updateUser = async (newData, merge = true) => {
    const updatedData = merge ? { ...userData, ...newData } : { ...DEFAULT_USER_CONFIG, ...newData };

    // Always update local storage
    if (enableLocalFallback) {
      setLocalUser(updatedData);
    }

    // Try to update cloud if connected
    if (isConnected) {
      const success = await updateCloudUser(updatedData, merge);
      if (!success && enableLocalFallback) {
        console.warn('Cloud sync failed, data saved locally');
      }
      return success;
    }

    return true;
  };

  // Sync local to cloud when connection is restored
  useEffect(() => {
    if (isConnected && enableLocalFallback && localUser && localUser.name) {
      const localTimestamp = localUser.updatedAt;
      const cloudTimestamp = cloudUser?.updatedAt;

      if (!cloudTimestamp || (localTimestamp && localTimestamp > cloudTimestamp)) {
        updateCloudUser(localUser);
      }
    }
  }, [isConnected, localUser, cloudUser, updateCloudUser, enableLocalFallback]);

  return {
    user: userData,
    calculated: calculatedData,
    loading: cloudLoading,
    updateUser,
    isOnline: isConnected,
    hasLocalData: enableLocalFallback && localUser?.name
  };
};

export const useCurrentUser = () => {
  const [currentUserId, setCurrentUserId] = usePersistentState('currentUserId', null);

  const switchUser = (userId) => {
    setCurrentUserId(userId);
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  return {
    currentUserId,
    switchUser,
    logout,
    isLoggedIn: Boolean(currentUserId)
  };
};

export default useUserData;