import React, { useState } from 'react';
import { Card, Button } from '../../../components/ui';
import useUserManagement from '../hooks/useUserManagement';

const UserSelector = ({ onUserSelected }) => {
  const { availableUsers, selectUser, loading } = useUserManagement();
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
  };

  const handleConfirm = () => {
    if (selectedUserId) {
      selectUser(selectedUserId);
      if (onUserSelected) {
        const selectedUser = availableUsers.find(u => u.id === selectedUserId);
        onUserSelected(selectedUser);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento utenti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            App Fitness
          </h1>
          <p className="text-gray-600">
            Seleziona il tuo profilo per continuare
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {availableUsers.map((user) => (
            <Card
              key={user.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedUserId === user.id
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                  : 'hover:shadow-md hover:scale-[1.02]'
              }`}
              onClick={() => handleUserSelect(user.id)}
              padding="md"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user.name.charAt(0)}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {user.name}
                  </h3>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Obiettivo: {user.startWeight}kg → {user.goalWeight}kg</p>
                    <p>Altezza: {user.height}cm</p>
                    {user.isLegacyUser && (
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Profilo Esistente
                      </span>
                    )}
                  </div>
                </div>

                {selectedUserId === user.id && (
                  <div className="text-blue-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!selectedUserId}
            onClick={handleConfirm}
          >
            Continua
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => {
              // TODO: Navigate to create user flow
              console.log('Create new user');
            }}
          >
            Crea Nuovo Profilo
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            I tuoi dati sono sincronizzati in modo sicuro
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSelector;