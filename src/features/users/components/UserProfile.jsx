import React, { useState } from 'react';
import { Card, Button, Input, ProgressBar } from '../../../components/ui';
import { calculateBMI, getBMIStatus, calculateWeightLossProgress } from '../../../utils/calculations';
import { formatDate } from '../../../utils/dateTime';

const UserProfile = ({ user, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const currentBMI = calculateBMI(user.startMeasurements.weight, user.height);
  const bmiStatus = getBMIStatus(currentBMI);
  const weightProgress = calculateWeightLossProgress(
    user.startWeight,
    user.startMeasurements.weight,
    user.goalWeight
  );

  const handleEdit = () => {
    setEditForm({
      name: user.name,
      height: user.height,
      goalWeight: user.goalWeight,
      intermediateGoalWeight: user.intermediateGoalWeight
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await onUpdateUser(user.id, editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({});
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6">
        <Card padding="lg">
          <h2 className="text-xl font-bold mb-6">Modifica Profilo</h2>

          <div className="space-y-4">
            <Input
              label="Nome"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />

            <Input
              label="Altezza"
              type="number"
              value={editForm.height}
              onChange={(e) => setEditForm({ ...editForm, height: parseInt(e.target.value) })}
              unit="cm"
              required
            />

            <Input
              label="Peso Obiettivo"
              type="number"
              value={editForm.goalWeight}
              onChange={(e) => setEditForm({ ...editForm, goalWeight: parseInt(e.target.value) })}
              unit="kg"
              required
            />

            <Input
              label="Obiettivo Intermedio"
              type="number"
              value={editForm.intermediateGoalWeight}
              onChange={(e) => setEditForm({ ...editForm, intermediateGoalWeight: parseInt(e.target.value) })}
              unit="kg"
            />
          </div>

          <div className="flex space-x-3 mt-6">
            <Button variant="primary" onClick={handleSave} className="flex-1">
              Salva
            </Button>
            <Button variant="secondary" onClick={handleCancel} className="flex-1">
              Annulla
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* Header */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500">Altezza: {user.height}cm</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleEdit}>
            ✏️
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{user.startWeight}kg</p>
            <p className="text-sm text-gray-500">Peso Iniziale</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{user.goalWeight}kg</p>
            <p className="text-sm text-gray-500">Obiettivo</p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-4">Progressi</h2>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Perdita Peso</span>
              <span>{weightProgress.percentage}%</span>
            </div>
            <ProgressBar
              value={weightProgress.percentage}
              variant="primary"
              size="md"
            />
            <p className="text-xs text-gray-500 mt-1">
              {weightProgress.lost}kg persi di {weightProgress.total}kg
            </p>
          </div>

          <div className={`p-3 rounded-lg ${bmiStatus.bgColor}`}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">BMI Attuale</span>
              <span className={`font-bold ${bmiStatus.color}`}>
                {currentBMI.toFixed(1)}
              </span>
            </div>
            <p className={`text-xs ${bmiStatus.color}`}>
              {bmiStatus.category}
            </p>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-4">Timeline</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Inizio</span>
            <span className="font-medium">{formatDate(user.startDate, 'DD/MM/YYYY')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Obiettivo</span>
            <span className="font-medium">{formatDate(user.endDate, 'DD/MM/YYYY')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Durata</span>
            <span className="font-medium">{user.durationWeeks} settimane</span>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-4">Misurazioni Iniziali</h2>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Peso</span>
            <span>{user.startMeasurements.weight}kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Grasso</span>
            <span>{user.startMeasurements.bodyFat}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Petto</span>
            <span>{user.startMeasurements.chest}cm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Vita</span>
            <span>{user.startMeasurements.waist}cm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fianchi</span>
            <span>{user.startMeasurements.hips}cm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Braccia</span>
            <span>{user.startMeasurements.arms}cm</span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button variant="secondary" className="w-full">
          Backup Dati
        </Button>
        <Button variant="danger" className="w-full" onClick={onLogout}>
          Esci dal Profilo
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;