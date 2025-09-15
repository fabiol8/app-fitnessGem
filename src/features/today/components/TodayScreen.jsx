import React, { useState } from 'react';
import { Card, Button } from '../../../components/ui';
import NotificationCard from '../../dashboard/components/NotificationCard';
import CountdownCards from '../../dashboard/components/CountdownCards';
import DailySummaryCard from '../../dashboard/components/DailySummaryCard';
import RescueBreathing from '../../mindfulness/components/RescueBreathing';

const TodayScreen = ({
  user,
  progress = {},
  updateProgress,
  fastingDays = {},
  className = ''
}) => {
  const [showRescueBreathing, setShowRescueBreathing] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  // Calculate nutrition summary for today
  const calculateNutritionSummary = () => {
    const todaysMeals = Object.entries(progress)
      .filter(([key]) => key.startsWith(`meal_${today}_`))
      .map(([, meal]) => meal);

    const consumed = todaysMeals.reduce((total, meal) => ({
      calories: total.calories + (meal.completed ? meal.calories : 0),
      protein: total.protein + (meal.completed ? meal.protein : 0),
      carbs: total.carbs + (meal.completed ? meal.carbs : 0),
      fats: total.fats + (meal.completed ? meal.fats : 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    const totals = {
      calories: user.dailyCalories || 2000,
      protein: user.dailyProtein || 120,
      carbs: user.dailyCarbs || 250,
      fats: user.dailyFats || 65
    };

    const burnedCalories = calculateBurnedCalories();

    return { totals, consumed, burnedCalories };
  };

  // Calculate burned calories from workouts
  const calculateBurnedCalories = () => {
    const todaysWorkouts = Object.entries(progress)
      .filter(([key]) => key.startsWith(`workout_${today}_`))
      .map(([, workout]) => workout);

    return todaysWorkouts.reduce((total, workout) => {
      if (workout.completed) {
        // Estimate calories based on workout type and duration
        const baseCalories = 200; // Base calories for workout
        const durationMultiplier = (workout.duration || 30) / 30; // Scale by duration
        return total + (baseCalories * durationMultiplier);
      }
      return total;
    }, 0);
  };

  // Get today's activity completion stats
  const getActivityStats = () => {
    const activityKeys = Object.keys(progress).filter(key =>
      key.startsWith(`activity_${today}_`)
    );

    const totalActivities = 10; // From the daily schedule in NotificationCard
    const completedActivities = activityKeys.length;

    return {
      completed: completedActivities,
      total: totalActivities,
      percentage: Math.round((completedActivities / totalActivities) * 100)
    };
  };

  // Get mindfulness stats for today
  const getMindfulnessStats = () => {
    const meditationSessions = Object.keys(progress).filter(key =>
      key.startsWith('meditation_') && key.includes(today)
    ).length;

    const breathingSessions = Object.keys(progress).filter(key =>
      key.startsWith('breathing_') && key.includes(today)
    ).length;

    return {
      sessions: meditationSessions + breathingSessions,
      target: 2
    };
  };

  // Get water intake for today
  const getWaterIntake = () => {
    const waterKey = `water_${today}`;
    const intake = progress[waterKey] || 0;
    return {
      current: intake,
      target: 8
    };
  };

  const nutritionSummary = calculateNutritionSummary();
  const activityStats = getActivityStats();
  const mindfulnessStats = getMindfulnessStats();
  const waterStats = getWaterIntake();

  const handleRescueComplete = (session) => {
    const key = `rescue_${today}_${Date.now()}`;
    updateProgress(key, {
      type: 'rescue',
      cycles: session.cycles,
      completedAt: session.completedAt
    });
    setShowRescueBreathing(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Emergency Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          📅 Oggi
        </h1>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowRescueBreathing(true)}
        >
          🆘 SOS
        </Button>
      </div>

      {/* Main Activity Notifications */}
      <NotificationCard
        user={user}
        progress={progress}
        updateProgress={updateProgress}
        fastingDays={fastingDays}
      />

      {/* Countdown Cards */}
      <CountdownCards user={user} />

      {/* Daily Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Activities Progress */}
        <Card glass padding="md" className="text-center">
          <div className="text-lg font-semibold text-slate-700 mb-2">
            📋 Attività
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {activityStats.completed}/{activityStats.total}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${activityStats.percentage}%` }}
            />
          </div>
          <div className="text-xs text-slate-500">
            {activityStats.percentage}% completato
          </div>
        </Card>

        {/* Mindfulness Sessions */}
        <Card glass padding="md" className="text-center">
          <div className="text-lg font-semibold text-slate-700 mb-2">
            🧘 Mindfulness
          </div>
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {mindfulnessStats.sessions}/{mindfulnessStats.target}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (mindfulnessStats.sessions / mindfulnessStats.target) * 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-500">
            Sessioni di oggi
          </div>
        </Card>

        {/* Water Intake */}
        <Card glass padding="md" className="text-center">
          <div className="text-lg font-semibold text-slate-700 mb-2">
            💧 Acqua
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {waterStats.current}/{waterStats.target}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (waterStats.current / waterStats.target) * 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-500">
            Bicchieri bevuti
          </div>
        </Card>

        {/* Calories Balance */}
        <Card glass padding="md" className="text-center">
          <div className="text-lg font-semibold text-slate-700 mb-2">
            🔥 Calorie
          </div>
          <div className="text-2xl font-bold text-green-600 mb-2">
            {Math.round(nutritionSummary.consumed.calories)}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (nutritionSummary.consumed.calories / nutritionSummary.totals.calories) * 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-500">
            di {nutritionSummary.totals.calories} target
          </div>
        </Card>
      </div>

      {/* Nutrition Summary */}
      <DailySummaryCard summary={nutritionSummary} />

      {/* Quick Actions */}
      <Card glass padding="lg">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          ⚡ Azioni Rapide
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="ghost"
            className="p-4 h-auto"
            onClick={() => {
              // Navigate to workout
              console.log('Navigate to workout');
            }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🏋️‍♂️</div>
              <div className="font-medium">Allenamento</div>
              <div className="text-xs text-slate-500">Inizia workout</div>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="p-4 h-auto"
            onClick={() => {
              // Navigate to nutrition
              console.log('Navigate to nutrition');
            }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🍽️</div>
              <div className="font-medium">Aggiungi Pasto</div>
              <div className="text-xs text-slate-500">Traccia nutrizione</div>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="p-4 h-auto"
            onClick={() => {
              // Navigate to mindfulness
              console.log('Navigate to mindfulness');
            }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🧘</div>
              <div className="font-medium">Meditazione</div>
              <div className="text-xs text-slate-500">5 min rilassamento</div>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="p-4 h-auto"
            onClick={() => {
              // Navigate to progress
              console.log('Navigate to progress');
            }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Progressi</div>
              <div className="text-xs text-slate-500">Vedi risultati</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Motivational Section */}
      <Card glass padding="lg">
        <div className="text-center">
          <div className="text-3xl mb-3">🌟</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Ottimo Lavoro, {user.name}!
          </h3>
          <p className="text-slate-600">
            {activityStats.percentage >= 80 ?
              'Stai andando alla grande! Continua così!' :
              activityStats.percentage >= 50 ?
              'Buon progresso! Mantieni il ritmo!' :
              'Ogni piccolo passo conta. Continua a impegnarti!'
            }
          </p>
        </div>
      </Card>

      {/* Rescue Breathing Modal */}
      <RescueBreathing
        isOpen={showRescueBreathing}
        onClose={() => setShowRescueBreathing(false)}
        onComplete={handleRescueComplete}
      />
    </div>
  );
};

export default TodayScreen;