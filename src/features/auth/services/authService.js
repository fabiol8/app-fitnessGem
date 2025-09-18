import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  auth,
  db,
  isFirebaseConfigured,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from '../../../firebase';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];

    if (isFirebaseConfigured && auth) {
      onAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        this.notifyListeners(user);
      });

      getRedirectResult(auth)
        .then(async (result) => {
          if (result && result.user) {
            this.currentUser = result.user;
            this.notifyListeners(result.user);

            try {
              await this.updateUserDocument(result.user.uid, {
                lastLoginAt: new Date()
              });
            } catch (err) {
              console.error('Failed to update user after redirect login', err);
            }
          }
        })
        .catch((redirectError) => {
          console.error('Google redirect sign-in error', redirectError);
        });
    }
  }

  // Auth state listeners
  addAuthListener(callback) {
    this.authListeners.push(callback);
    return () => {
      this.authListeners = this.authListeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners(user) {
    this.authListeners.forEach(callback => callback(user));
  }

  // Authentication methods
  async signUp(email, password, userData) {
    try {
      if (!auth) throw new Error('Firebase not configured');

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {
        displayName: userData.name
      });

      // Create user document in Firestore
      await this.createUserDocument(user.uid, {
        ...userData,
        email: user.email,
        createdAt: new Date(),
        lastLoginAt: new Date()
      });

      return { user, error: null };
    } catch (error) {
      return { user: null, error: this.handleAuthError(error) };
    }
  }

  async signIn(email, password) {
    try {
      // Demo mode for testing
      if (email === 'test@fitnessapp.com' && password === 'TestPass123!') {
        const demoUser = {
          uid: 'demo-user-123',
          email: 'test@fitnessapp.com',
          displayName: 'Demo User'
        };

        setTimeout(() => {
          this.currentUser = demoUser;
          this.notifyListeners(demoUser);
        }, 100);

        return { user: demoUser, error: null };
      }

      if (!auth) throw new Error('Firebase not configured');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login
      await this.updateUserDocument(user.uid, {
        lastLoginAt: new Date()
      });

      return { user, error: null };
    } catch (error) {
      return { user: null, error: this.handleAuthError(error) };
    }
  }

  async signInWithGoogle() {
    if (!auth) {
      return { user: null, error: 'Firebase non configurato' };
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);

      await this.updateUserDocument(result.user.uid, {
        lastLoginAt: new Date()
      });

      return { user: result.user, error: null };
    } catch (error) {
      console.error('Google sign-in failed', error);

      if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, provider);
          return { user: null, error: null, redirect: true };
        } catch (redirectError) {
          console.error('Google sign-in redirect fallback failed', redirectError);
          return { user: null, error: this.handleAuthError(redirectError) };
        }
      }

      if (error?.code === 'auth/popup-blocked') {
        return { user: null, error: 'Popup bloccato dal browser. Abilita i popup per questo sito.' };
      }

      if (error?.code === 'auth/configuration-not-found' || error?.message?.includes('not configured')) {
        return { user: null, error: 'Google Auth non configurato. Contatta l\'amministratore.' };
      }

      return { user: null, error: this.handleAuthError(error) };
    }
  }

  async signOut() {
    try {
      if (!auth) throw new Error('Firebase not configured');
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error: this.handleAuthError(error) };
    }
  }

  async resetPassword(email) {
    try {
      if (!auth) throw new Error('Firebase not configured');
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      return { error: this.handleAuthError(error) };
    }
  }

  async updateUserProfile(updates) {
    try {
      if (!auth?.currentUser) throw new Error('No authenticated user');

      // Update Firebase Auth profile
      if (updates.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName
        });
      }

      // Update Firestore document
      await this.updateUserDocument(auth.currentUser.uid, updates);

      return { error: null };
    } catch (error) {
      return { error: this.handleAuthError(error) };
    }
  }

  async deleteAccount(password) {
    try {
      if (!auth?.currentUser) throw new Error('No authenticated user');

      const user = auth.currentUser;

      // Re-authenticate user before deletion
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete user document from Firestore
      await this.deleteUserDocument(user.uid);

      // Delete user from Firebase Auth
      await deleteUser(user);

      return { error: null };
    } catch (error) {
      return { error: this.handleAuthError(error) };
    }
  }

  // Firestore user document methods
  async createUserDocument(uid, userData) {
    if (!db) {
      // Store user data locally if Firestore is not available
      this.setLocalUser({ id: uid, ...userData });
      return;
    }

    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...userData,
        fitnessProfile: {
          goals: userData.goals || [],
          currentWeight: userData.currentWeight || null,
          targetWeight: userData.targetWeight || null,
          height: userData.height || null,
          activityLevel: userData.activityLevel || 'moderate',
          preferences: {
            units: 'metric',
            notifications: true,
            privacy: 'private'
          }
        }
      });
    } catch (error) {
      console.warn('Firestore unavailable, storing user data locally:', error.message);
      // Fallback to local storage
      this.setLocalUser({
        id: uid,
        ...userData,
        fitnessProfile: {
          goals: userData.goals || [],
          currentWeight: userData.currentWeight || null,
          targetWeight: userData.targetWeight || null,
          height: userData.height || null,
          activityLevel: userData.activityLevel || 'moderate',
          preferences: {
            units: 'metric',
            notifications: true,
            privacy: 'private'
          }
        }
      });
    }
  }

  async getUserDocument(uid) {
    if (!db) {
      // Try to get user from localStorage if Firestore is not available
      const localUser = this.getLocalUser();
      return localUser && localUser.id === uid ? localUser : null;
    }

    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return { id: uid, ...userSnap.data() };
      }
      return null;
    } catch (error) {
      console.warn('Firestore unavailable, trying localStorage:', error.message);
      // Fallback to localStorage
      const localUser = this.getLocalUser();
      return localUser && localUser.id === uid ? localUser : null;
    }
  }

  async updateUserDocument(uid, updates) {
    if (!db) {
      // Update localStorage if Firestore is not available
      const localUser = this.getLocalUser();
      if (localUser && localUser.id === uid) {
        this.setLocalUser({ ...localUser, ...updates, updatedAt: new Date() });
      }
      return;
    }

    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.warn('Firestore unavailable, updating localStorage:', error.message);
      // Fallback to localStorage
      const localUser = this.getLocalUser();
      if (localUser && localUser.id === uid) {
        this.setLocalUser({ ...localUser, ...updates, updatedAt: new Date() });
      }
    }
  }

  async deleteUserDocument(uid) {
    if (!db) return;

    try {
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error deleting user document:', error);
    }
  }

  // Validation helpers
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
      checks: {
        minLength: password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      }
    };
  }

  // Error handling
  handleAuthError(error) {
    const errorMessages = {
      'auth/user-not-found': 'Nessun account trovato con questa email.',
      'auth/wrong-password': 'Password non corretta.',
      'auth/email-already-in-use': 'Questa email è già registrata.',
      'auth/weak-password': 'La password deve essere di almeno 6 caratteri.',
      'auth/invalid-email': 'Email non valida.',
      'auth/user-disabled': 'Questo account è stato disabilitato.',
      'auth/too-many-requests': 'Troppi tentativi. Riprova più tardi.',
      'auth/network-request-failed': 'Errore di connessione. Controlla la tua connessione internet.',
      'auth/requires-recent-login': 'Per questa operazione devi effettuare nuovamente il login.'
    };

    return {
      code: error.code,
      message: errorMessages[error.code] || error.message || 'Si è verificato un errore imprevisto.'
    };
  }

  // Utility methods
  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  // Offline fallback
  getLocalUser() {
    try {
      const localUser = localStorage.getItem('fitness_app_user');
      return localUser ? JSON.parse(localUser) : null;
    } catch {
      return null;
    }
  }

  setLocalUser(user) {
    try {
      localStorage.setItem('fitness_app_user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }

  removeLocalUser() {
    try {
      localStorage.removeItem('fitness_app_user');
    } catch (error) {
      console.error('Error removing user from localStorage:', error);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
