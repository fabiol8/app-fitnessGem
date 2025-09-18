import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = authService.addAuthListener(async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        try {
          // Fetch complete user profile from Firestore
          const profile = await authService.getUserDocument(firebaseUser.uid);
          setUser(firebaseUser);
          setUserProfile(profile);
          authService.setLocalUser({ ...firebaseUser, profile });
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError('Errore nel caricamento del profilo utente');
          // Fallback to basic user info
          setUser(firebaseUser);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        authService.removeLocalUser();
      }

      setLoading(false);
    });

    // Check for offline user
    if (!authService.getCurrentUser()) {
      const localUser = authService.getLocalUser();
      if (localUser) {
        setUser(localUser);
        setUserProfile(localUser.profile);
      }
      setLoading(false);
    }

    return unsubscribe;
  }, []);

  // Authentication methods
  const signUp = useCallback(async (email, password, userData) => {
    setLoading(true);
    setError(null);

    const result = await authService.signUp(email, password, userData);

    if (result.error) {
      setError(result.error.message);
    }

    setLoading(false);
    return result;
  }, []);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    const result = await authService.signIn(email, password);

    if (result.error) {
      setError(result.error.message);
    }

    setLoading(false);
    return result;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await authService.signInWithGoogle();

    if (result?.error) {
      setError(result.error.message || result.error);
    }

    if (!result?.redirect) {
      setLoading(false);
    }
    return result;
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await authService.signOut();

    if (result.error) {
      setError(result.error.message);
    }

    setLoading(false);
    return result;
  }, []);

  const resetPassword = useCallback(async (email) => {
    setError(null);

    const result = await authService.resetPassword(email);

    if (result.error) {
      setError(result.error.message);
    }

    return result;
  }, []);

  const updateProfile = useCallback(async (updates) => {
    setError(null);

    const result = await authService.updateUserProfile(updates);

    if (result.error) {
      setError(result.error.message);
    } else {
      // Refresh user profile
      if (user) {
        const updatedProfile = await authService.getUserDocument(user.uid);
        setUserProfile(updatedProfile);
      }
    }

    return result;
  }, [user]);

  const deleteAccount = useCallback(async (password) => {
    setLoading(true);
    setError(null);

    const result = await authService.deleteAccount(password);

    if (result.error) {
      setError(result.error.message);
    }

    setLoading(false);
    return result;
  }, []);

  // Utility methods
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isAuthenticated = user !== null;

  const hasCompletedOnboarding = userProfile?.onboardingCompleted || false;

  const getUserDisplayName = () => {
    return userProfile?.name || user?.displayName || user?.email || 'Utente';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return {
    // State
    user,
    userProfile,
    loading,
    error,
    isAuthenticated,
    hasCompletedOnboarding,

    // Methods
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    deleteAccount,
    clearError,

    // Utilities
    getUserDisplayName,
    getUserInitials
  };
};
