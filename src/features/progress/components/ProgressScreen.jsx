import React, { useState } from 'react';
import { Card, Button, ProgressBar } from '../../../components/ui';
import BMICalculator from './BMICalculator';
import WeeklyMeasurementForm from './WeeklyMeasurementForm';
import ProgressChart from './ProgressChart';

const ProgressScreen = ({
  user,
  progress = {},
  updateProgress,
  className = ''
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // week, month, 3months, all
  const [showBMICalculator, setShowBMICalculator] = useState(false);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);

  // Calculate current statistics
  const getCurrentStats = () => {
    const today = new Date().toISOString().slice(0, 10);
    const currentWeight = user?.startWeight || 70;
    const goalWeight = user?.goalWeight || 65;
    const startDate = new Date(user?.startDate || Date.now());
    const endDate = new Date(user?.endDate || Date.now() + 90 * 24 * 60 * 60 * 1000);

    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDays - daysElapsed);

    const weightLoss = currentWeight - goalWeight;
    const progressPercentage = Math.min(100, (daysElapsed / totalDays) * 100);

    return {
      currentWeight,
      goalWeight,
      weightLoss,
      daysElapsed,
      daysRemaining,
      totalDays,
      progressPercentage,
      isOnTrack: daysElapsed <= totalDays
    };
  };

  // Get recent measurements
  const getRecentMeasurements = () => {
    const measurements = Object.entries(progress)
      .filter(([key]) => key.startsWith('measurement_'))
      .map(([key, data]) => ({
        date: key.split('_')[1],
        ...data
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return measurements;
  };

  // Calculate BMI
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // Get workout statistics
  const getWorkoutStats = () => {
    const workoutKeys = Object.keys(progress).filter(key =>
      key.includes('workout_') && key.endsWith('_completed')
    );

    const totalWorkouts = workoutKeys.length;
    const completedWorkouts = workoutKeys.filter(key => progress[key]).length;
    const completionRate = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

    return {
      totalWorkouts,
      completedWorkouts,
      completionRate
    };
  };

  const stats = getCurrentStats();
  const recentMeasurements = getRecentMeasurements();
  const workoutStats = getWorkoutStats();
  const currentBMI = calculateBMI(stats.currentWeight, user?.height);
  const goalBMI = calculateBMI(stats.goalWeight, user?.height);

  const isMonday = new Date().getDay() === 1;
  const today = new Date().toISOString().slice(0, 10);
  const hasWeeklyMeasurement = Object.keys(progress).some(key =>
    key.startsWith(`measurement_${today}`)
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card glass padding="lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">
              =Ê I Tuoi Progressi
            </h1>
            <p className="text-slate-600">
              Monitora il tuo percorso di trasformazione
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(stats.progressPercentage)}%
            </div>
            <div className="text-sm text-slate-500">Completato</div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card glass padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.currentWeight}kg
            </div>
            <div className="text-sm text-slate-500">Peso Attuale</div>
          </div>
        </Card>

        <Card glass padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.goalWeight}kg
            </div>
            <div className="text-sm text-slate-500">Obiettivo</div>
          </div>
        </Card>

        <Card glass padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.daysRemaining}
            </div>
            <div className="text-sm text-slate-500">Giorni Rimasti</div>
          </div>
        </Card>

        <Card glass padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {currentBMI || '--'}
            </div>
            <div className="text-sm text-slate-500">BMI Attuale</div>
          </div>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card glass padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-700">
            <¯ Progresso Obiettivo
          </h3>
          <span className={`text-sm px-2 py-1 rounded-full ${
            stats.isOnTrack ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {stats.isOnTrack ? 'In tempo' : 'Attenzione'}
          </span>
        </div>

        <ProgressBar
          value={stats.progressPercentage}
          variant="primary"
          size="lg"
          className="mb-4"
        />

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-slate-700">
              {stats.daysElapsed}/{stats.totalDays}
            </div>
            <div className="text-sm text-slate-500">Giorni</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {workoutStats.completedWorkouts}
            </div>
            <div className="text-sm text-slate-500">Allenamenti</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {workoutStats.completionRate}%
            </div>
            <div className="text-sm text-slate-500">Completamento</div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant={isMonday && !hasWeeklyMeasurement ? "primary" : "secondary"}
          size="lg"
          onClick={() => setShowMeasurementForm(true)}
        >
          =Ï {isMonday && !hasWeeklyMeasurement ? 'Misurazioni Settimanali' : 'Aggiungi Misurazione'}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => setShowBMICalculator(true)}
        >
          >î Calcola BMI
        </Button>
      </div>

      {/* Progress Chart */}
      <Card glass padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-700">
            =È Andamento nel Tempo
          </h3>

          <div className="flex space-x-2">
            {['week', 'month', '3months', 'all'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {period === 'week' ? '7gg' :
                 period === 'month' ? '30gg' :
                 period === '3months' ? '3m' : 'Tutto'}
              </button>
            ))}
          </div>
        </div>

        <ProgressChart
          data={recentMeasurements}
          period={selectedPeriod}
          user={user}
        />
      </Card>

      {/* Recent Measurements */}
      <Card glass padding="lg">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          =Ë Misurazioni Recenti
        </h3>

        {recentMeasurements.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">=Ï</div>
            <p className="text-slate-500 mb-4">
              Nessuna misurazione registrata
            </p>
            <Button
              variant="primary"
              onClick={() => setShowMeasurementForm(true)}
            >
              Aggiungi Prima Misurazione
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMeasurements.map((measurement, index) => (
              <div
                key={measurement.date}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
              >
                <div>
                  <div className="font-medium text-slate-700">
                    {new Date(measurement.date).toLocaleDateString('it-IT')}
                  </div>
                  <div className="text-sm text-slate-500">
                    {index === 0 ? 'Ultima misurazione' : `${index + 1}° misurazione`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-700">
                    {measurement.weight}kg
                  </div>
                  {measurement.bodyFat && (
                    <div className="text-sm text-slate-500">
                      {measurement.bodyFat}% grasso
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Goal Achievement */}
      <Card glass padding="lg">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          <Æ Obiettivi e Traguardi
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <¯
              </div>
              <div>
                <div className="font-medium text-blue-800">Obiettivo Peso</div>
                <div className="text-sm text-blue-600">
                  Raggiungi {stats.goalWeight}kg
                </div>
              </div>
            </div>
            <div className="text-blue-700 font-bold">
              {Math.max(0, stats.currentWeight - stats.goalWeight).toFixed(1)}kg rimasti
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white">
                =ª
              </div>
              <div>
                <div className="font-medium text-green-800">Costanza Allenamenti</div>
                <div className="text-sm text-green-600">
                  Mantieni {user?.workoutDays || 3} giorni/settimana
                </div>
              </div>
            </div>
            <div className="text-green-700 font-bold">
              {workoutStats.completionRate}%
            </div>
          </div>
        </div>
      </Card>

      {/* BMI Calculator Modal */}
      <BMICalculator
        isOpen={showBMICalculator}
        onClose={() => setShowBMICalculator(false)}
        currentWeight={stats.currentWeight}
        height={user?.height}
      />

      {/* Weekly Measurement Form Modal */}
      <WeeklyMeasurementForm
        isOpen={showMeasurementForm}
        onClose={() => setShowMeasurementForm(false)}
        onSave={(data) => {
          const key = `measurement_${new Date().toISOString().slice(0, 10)}`;
          updateProgress(key, data);
          setShowMeasurementForm(false);
        }}
        lastMeasurement={recentMeasurements[0]}
      />
    </div>
  );
};

export default ProgressScreen;