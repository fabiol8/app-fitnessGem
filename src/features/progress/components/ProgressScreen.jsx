import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../../components/ui';
import { useProgress, useWeeklyMeasurements } from '../../../hooks';
import BMICalculator from './BMICalculator';
import ProgressChart from './ProgressChart';
import WeeklyMeasurementForm from './WeeklyMeasurementForm';

const ProgressScreen = ({ user, onUpdateUser }) => {
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [message, setMessage] = useState('');

  // Hooks per gestione dati
  const { progress, updateProgress } = useProgress(user.id);
  const { measurements, addMeasurement, getMeasurementHistory } = useWeeklyMeasurements(user.id);

  // Converti measurements in formato array per compatibilità
  const weeklyData = getMeasurementHistory(20); // Ultimi 20 entries

  const currentWeight = weeklyData.length > 0
    ? weeklyData[0].weight // getMeasurementHistory restituisce in ordine decrescente
    : user.startWeight;

  // Check se è necessaria una misurazione settimanale
  const isNewMeasurementDue = () => {
    if (weeklyData.length === 0) return true;

    const lastMeasurement = weeklyData[0];
    const lastDate = new Date(lastMeasurement.date);
    const today = new Date();
    const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    return daysDiff >= 7; // Una settimana è passata
  };

  const handleAddMeasurement = async (measurementData) => {
    try {
      const success = await addMeasurement(measurementData.date, measurementData);

      if (success) {
        setMessage('✅ Misurazioni salvate con successo!');

        // Aggiorna anche il progresso generale
        await updateProgress({
          currentWeight: measurementData.weight,
          lastMeasurementDate: measurementData.date,
          measurementCount: weeklyData.length + 1
        });
      } else {
        setMessage('❌ Errore nel salvare le misurazioni');
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding measurement:', error);
      setMessage('❌ Errore nel salvare le misurazioni');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleGoalUpdate = async (newGoals) => {
    try {
      const updatedUser = {
        ...user,
        ...newGoals,
        updatedAt: Date.now()
      };

      await onUpdateUser(updatedUser);
      setMessage('🎯 Obiettivi aggiornati con successo!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating goals:', error);
      setMessage('❌ Errore nell\'aggiornare gli obiettivi');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header con Azioni */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progressi</h1>
          <p className="text-gray-600">Tracciamento obiettivi e misurazioni</p>
        </div>

        <div className="flex space-x-3">
          {isNewMeasurementDue() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mr-3">
              <p className="text-xs text-yellow-800 font-medium">
                📅 Misurazione settimanale dovuta
              </p>
            </div>
          )}

          <Button
            variant="primary"
            onClick={() => setShowMeasurementForm(true)}
            icon="📏"
          >
            Nuova Misurazione
          </Button>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <Card padding="md" className="bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">{message}</p>
        </Card>
      )}

      {/* Main Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ProgressChart
            user={user}
            weeklyData={weeklyData}
          />
        </div>

        {/* BMI Calculator - Takes 1 column */}
        <div>
          <BMICalculator
            weight={currentWeight}
            height={user.height}
          />
        </div>
      </div>

      {/* Recent Measurements */}
      {weeklyData.length > 0 && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Misurazioni Recenti
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-700">Data</th>
                  <th className="text-right py-2 font-medium text-gray-700">Peso</th>
                  <th className="text-right py-2 font-medium text-gray-700">Grasso</th>
                  <th className="text-right py-2 font-medium text-gray-700">Vita</th>
                  <th className="text-right py-2 font-medium text-gray-700">Differenza</th>
                </tr>
              </thead>
              <tbody>
                {weeklyData.slice(0, 5).map((entry, index) => {
                  const prevEntry = weeklyData[index + 1];
                  const weightDiff = prevEntry ? entry.weight - prevEntry.weight : null;

                  return (
                    <tr key={entry.date} className="border-b border-gray-100">
                      <td className="py-2">
                        {new Date(entry.date).toLocaleDateString('it-IT')}
                      </td>
                      <td className="text-right py-2 font-medium">
                        {entry.weight}kg
                      </td>
                      <td className="text-right py-2">
                        {entry.bodyFat ? `${entry.bodyFat}%` : '-'}
                      </td>
                      <td className="text-right py-2">
                        {entry.waist ? `${entry.waist}cm` : '-'}
                      </td>
                      <td className={`text-right py-2 font-medium ${
                        weightDiff ? (weightDiff < 0 ? 'text-green-600' : 'text-red-600') : ''
                      }`}>
                        {weightDiff ? `${weightDiff > 0 ? '+' : ''}${weightDiff.toFixed(1)}kg` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {weeklyData.length > 5 && (
            <div className="mt-3 text-center">
              <button className="text-sm text-blue-600 hover:underline">
                Mostra tutte le misurazioni ({weeklyData.length})
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Goal Management */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Gestione Obiettivi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">Obiettivo Finale</h4>
            <p className="text-2xl font-bold text-blue-600">{user.goalWeight}kg</p>
            <p className="text-sm text-gray-500">
              Da {user.startWeight}kg (-{(user.startWeight - user.goalWeight).toFixed(1)}kg)
            </p>
          </div>

          {user.intermediateGoalWeight && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Obiettivo Intermedio</h4>
              <p className="text-2xl font-bold text-orange-600">{user.intermediateGoalWeight}kg</p>
              <p className="text-sm text-gray-500">
                Traguardo intermedio
              </p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              // TODO: Aprire modal per modifica obiettivi
              console.log('Open goal editing modal');
            }}
          >
            Modifica Obiettivi
          </Button>
        </div>
      </Card>

      {/* Weekly Measurement Form Modal */}
      <WeeklyMeasurementForm
        isOpen={showMeasurementForm}
        onClose={() => setShowMeasurementForm(false)}
        onSubmit={handleAddMeasurement}
        user={user}
      />
    </div>
  );
};

export default ProgressScreen;