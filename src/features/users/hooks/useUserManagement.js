import { useState, useEffect, useCallback } from 'react';
import { useFirestore } from '../../../hooks/useFirestore';
import { usePersistentState } from '../../../hooks/usePersistentState';
import { LEGACY_USERS, DEFAULT_USER_TEMPLATE } from '../../../data/users';

export const useUserManagement = () => {
  const [currentUserId, setCurrentUserId] = usePersistentState('currentUserId', null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load available users (legacy + cloud users)
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Start with legacy users
        const legacyUsers = Object.values(LEGACY_USERS);

        // TODO: Add cloud users from Firestore collection
        // const cloudUsers = await getUsersFromFirestore();

        setAvailableUsers(legacyUsers);
      } catch (error) {
        console.error('Error loading users:', error);
        setAvailableUsers(Object.values(LEGACY_USERS));
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const selectUser = useCallback((userId) => {
    setCurrentUserId(userId);
  }, [setCurrentUserId]);

  const createUser = useCallback(async (userData) => {
    try {
      const newUser = {
        ...DEFAULT_USER_TEMPLATE,
        ...userData,
        id: userData.id || generateUserId(userData.name),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // TODO: Save to Firestore
      // await saveUserToFirestore(newUser);

      // For now, add to local state
      setAvailableUsers(prev => [...prev, newUser]);
      setCurrentUserId(newUser.id);

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  }, [setCurrentUserId]);

  const updateUser = useCallback(async (userId, userData) => {
    try {
      const updatedUser = {
        ...userData,
        updatedAt: Date.now()
      };

      // TODO: Update in Firestore
      // await updateUserInFirestore(userId, updatedUser);

      // Update local state
      setAvailableUsers(prev =>
        prev.map(user => user.id === userId ? { ...user, ...updatedUser } : user)
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    try {
      // TODO: Delete from Firestore
      // await deleteUserFromFirestore(userId);

      // Remove from local state
      setAvailableUsers(prev => prev.filter(user => user.id !== userId));

      // If current user is deleted, clear selection
      if (currentUserId === userId) {
        setCurrentUserId(null);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }
  }, [currentUserId, setCurrentUserId]);

  const logout = useCallback(() => {
    setCurrentUserId(null);
  }, [setCurrentUserId]);

  const getCurrentUser = useCallback(() => {
    if (!currentUserId) return null;
    return availableUsers.find(user => user.id === currentUserId) || null;
  }, [currentUserId, availableUsers]);

  return {
    // State
    currentUserId,
    availableUsers,
    currentUser: getCurrentUser(),
    loading,
    isLoggedIn: Boolean(currentUserId),

    // Actions
    selectUser,
    createUser,
    updateUser,
    deleteUser,
    logout
  };
};

// Helper function to generate user ID
const generateUserId = (name) => {
  return name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
};

export default useUserManagement;