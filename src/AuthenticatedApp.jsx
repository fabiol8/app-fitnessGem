import React, { useState, useEffect } from 'react';
import { useAuth } from './features/auth/hooks/useAuth';
import { useNotifications } from './contexts/NotificationContext';
import OnboardingFlow from './features/onboarding/components/OnboardingFlow';
import { authService } from './features/auth/services/authService';

const AuthenticatedApp = () => {
  const { user, signOut, getUserDisplayName } = useAuth();
  const { addNotification } = useNotifications();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompletingOnboarding, setIsCompletingOnboarding] = useState(false);

  useEffect(() => {
    const checkUserProfile = async () => {
      console.log('checkUserProfile called, user:', user);

      if (!user) {
        console.log('No user, setting loading to false');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching profile for user:', user.uid);
        const profile = await authService.getUserDocument(user.uid);
        console.log('Profile fetched:', profile);
        setUserProfile(profile);

        // Se l'utente non ha completato l'onboarding, mostralo
        if (!profile || !profile.onboardingCompleted) {
          console.log('Showing onboarding');
          setShowOnboarding(true);
        } else {
          console.log('Onboarding completed, showing dashboard');
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        // Se c'è un errore, mostra l'onboarding per sicurezza
        setShowOnboarding(true);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    checkUserProfile();
  }, [user]);

  const handleOnboardingComplete = async (profileData) => {
    // Prevent multiple submissions
    if (isCompletingOnboarding) return;

    try {
      if (
        !profileData.age ||
        !profileData.weight ||
        !profileData.height ||
        !profileData.goals?.length ||
        !profileData.experience
      ) {
        addNotification({
          type: 'error',
          title: 'Dati incompleti',
          message: 'Completa tutti i campi obbligatori per procedere.'
        });
        return;
      }

      setIsCompletingOnboarding(true);
      setLoading(true);

      const completeProfile = {
        name: user.displayName || user.email,
        email: user.email,
        age: Number(profileData.age),
        weight: profileData.weight ? Number(profileData.weight) : null,
        height: profileData.height ? Number(profileData.height) : null,
        gender: profileData.gender || null,
        goals: profileData.goals,
        experienceLevel: profileData.experience,
        weeklyWorkouts: Number(profileData.weeklyWorkouts) || 3,
        preferredWorkoutTime: profileData.preferredWorkoutTime,
        nutrition: profileData.nutrition,
        preferences: profileData.preferences,
        onboardingCompleted: true,
        lastLoginAt: new Date(),
        fitnessProfile: {
          goals: profileData.goals,
          currentWeight: profileData.weight ? Number(profileData.weight) : null,
          targetWeight: profileData.targetWeight ? Number(profileData.targetWeight) : null,
          height: profileData.height ? Number(profileData.height) : null,
          activityLevel: profileData.experience,
          weeklyWorkouts: Number(profileData.weeklyWorkouts) || 3,
          preferredWorkoutTime: profileData.preferredWorkoutTime,
          preferences: profileData.preferences,
          nutrition: profileData.nutrition,
        }
      };

      await authService.updateUserDocument(user.uid, completeProfile);

      setUserProfile(prev => ({
        id: user.uid,
        ...(prev || {}),
        ...completeProfile,
      }));

      // Complete onboarding
      setShowOnboarding(false);
      setLoading(false);
      setIsCompletingOnboarding(false);

      addNotification({
        type: 'success',
        title: 'Profilo configurato!',
        message: 'Il tuo profilo è stato configurato con successo. Benvenuto!'
      });

    } catch (error) {
      console.error('Error completing onboarding:', error);
      setLoading(false);
      setIsCompletingOnboarding(false);
      addNotification({
        type: 'error',
        title: 'Errore',
        message: 'Errore durante il salvataggio del profilo. Riprova.'
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">💪</span>
          </div>
          <p className="text-gray-600">Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if needed
  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        user={user}
        initialProfile={userProfile}
      />
    );
  }

  // Main authenticated app
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🎉 Benvenuto, {getUserDisplayName()}!
              </h1>
              <p className="text-gray-600 mt-1">
                Il tuo profilo è configurato e l'app è pronta all'uso!
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Summary */}
        {userProfile && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Il tuo profilo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userProfile.age && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">🎂</div>
                  <div className="font-medium text-gray-900">{userProfile.age} anni</div>
                </div>
              )}
              {userProfile.weight && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">⚖️</div>
                  <div className="font-medium text-gray-900">{userProfile.weight} kg</div>
                </div>
              )}
              {userProfile.height && (
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">📏</div>
                  <div className="font-medium text-gray-900">{userProfile.height} cm</div>
                </div>
              )}
            </div>
            {userProfile.goals && userProfile.goals.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">I tuoi obiettivi:</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.goals.map((goal, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {goal.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="text-green-600 text-2xl">✅</div>
            <div>
              <h2 className="text-lg font-semibold text-green-800">
                App Fitness Attiva!
              </h2>
              <p className="text-green-700 mt-1">
                Il sistema di autenticazione multiutente funziona correttamente.
                L'onboarding è completato e il profilo è salvato.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">🔥 Firebase</h3>
              <p className="text-sm text-gray-600">Autenticazione e storage attivi</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">⚛️ React</h3>
              <p className="text-sm text-gray-600">Componenti funzionanti</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">🎯 Onboarding</h3>
              <p className="text-sm text-gray-600">Completato con successo</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">💾 Profilo</h3>
              <p className="text-sm text-gray-600">Salvato e sincronizzato</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedApp;
