import React, { useState } from 'react';
import { Card, Button, ProgressBar } from '../../../components/ui';
import MealForm from './MealForm';
import MealCard from './MealCard';
import DailySummaryCard from '../../dashboard/components/DailySummaryCard';

const NutritionScreen = ({
  user,
  progress = {},
  updateProgress,
  className = ''
}) => {
  const [showMealForm, setShowMealForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const getTodaysMeals = () => {
    return Object.entries(progress)
      .filter(([key]) => key.startsWith(`meal_${selectedDate}_`))
      .map(([key, meal]) => ({ key, ...meal }))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const calculateDailySummary = () => {
    const meals = getTodaysMeals();
    const consumed = meals.reduce((total, meal) => ({
      calories: total.calories + (meal.completed ? meal.calories : 0),
      protein: total.protein + (meal.completed ? meal.protein : 0),
      carbs: total.carbs + (meal.completed ? meal.carbs : 0),
      fats: total.fats + (meal.completed ? meal.fats : 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    // User's daily targets based on their goals
    const totals = {
      calories: user.dailyCalories || 2000,
      protein: user.dailyProtein || 120,
      carbs: user.dailyCarbs || 250,
      fats: user.dailyFats || 65
    };

    // Estimated calories burned (basic calculation)
    const burnedCalories = 300; // This would come from workout/activity data

    return { totals, consumed, burnedCalories };
  };

  const summary = calculateDailySummary();
  const todaysMeals = getTodaysMeals();

  const handleSaveMeal = (mealData) => {
    const key = editingMeal ? editingMeal.key : `meal_${selectedDate}_${mealData.id}`;
    updateProgress(key, mealData);
    setEditingMeal(null);
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setShowMealForm(true);
  };

  const handleDeleteMeal = (mealKey) => {
    if (window.confirm('Sei sicuro di voler eliminare questo pasto?')) {
      const newProgress = { ...progress };
      delete newProgress[mealKey];
      // Update progress with the new object (this would typically be handled by the parent)
      // For now, we'll just log it
      console.log('Delete meal:', mealKey);
    }
  };

  const handleToggleComplete = (mealKey) => {
    const meal = progress[mealKey];
    updateProgress(mealKey, { ...meal, completed: !meal.completed });
  };

  const getWaterIntake = () => {
    const waterKey = `water_${selectedDate}`;
    return progress[waterKey] || 0;
  };

  const updateWaterIntake = (glasses) => {
    const waterKey = `water_${selectedDate}`;
    updateProgress(waterKey, Math.max(0, glasses));
  };

  const waterIntake = getWaterIntake();
  const targetWater = 8; // 8 glasses per day

  const getMealsByType = () => {
    const mealTypes = {
      'breakfast': [],
      'snack-morning': [],
      'lunch': [],
      'snack-afternoon': [],
      'dinner': [],
      'snack-evening': []
    };

    todaysMeals.forEach(meal => {
      if (mealTypes[meal.type]) {
        mealTypes[meal.type].push(meal);
      }
    });

    return mealTypes;
  };

  const mealsByType = getMealsByType();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Date Selector */}
      <Card glass padding="md">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            📊 Nutrizione
          </h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1 border border-slate-300 rounded-md text-sm"
          />
        </div>
      </Card>

      {/* Daily Summary */}
      <DailySummaryCard
        summary={summary}
        className="mb-6"
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            setEditingMeal(null);
            setShowMealForm(true);
          }}
        >
          ➕ Aggiungi Pasto
        </Button>

        {/* Water Intake */}
        <Card glass padding="md">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600 mb-2">
              💧 Idratazione
            </div>
            <div className="text-2xl font-bold text-blue-700 mb-2">
              {waterIntake}/{targetWater}
            </div>
            <ProgressBar
              value={(waterIntake / targetWater) * 100}
              variant="info"
              size="sm"
              className="mb-3"
            />
            <div className="flex justify-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateWaterIntake(waterIntake - 1)}
                disabled={waterIntake <= 0}
              >
                ➖
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => updateWaterIntake(waterIntake + 1)}
              >
                ➕
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Meals Timeline */}
      <Card glass padding="lg">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          🍽️ Pasti di Oggi
        </h3>

        {todaysMeals.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🍽️</div>
            <p className="text-slate-500 mb-4">
              Nessun pasto registrato per oggi
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setEditingMeal(null);
                setShowMealForm(true);
              }}
            >
              Aggiungi il primo pasto
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {todaysMeals.map((meal) => (
              <MealCard
                key={meal.key}
                meal={meal}
                onEdit={() => handleEditMeal(meal)}
                onDelete={() => handleDeleteMeal(meal.key)}
                onToggleComplete={() => handleToggleComplete(meal.key)}
                showMacros={true}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Nutrition Tips */}
      <Card glass padding="lg">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          💡 Consigli Nutrizionali
        </h3>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start space-x-2">
            <span className="text-green-500">•</span>
            <span>Cerca di consumare proteine ad ogni pasto per mantenere la massa muscolare</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">•</span>
            <span>Bevi almeno 8 bicchieri d'acqua al giorno per una corretta idratazione</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-purple-500">•</span>
            <span>Distribuisci i carboidrati durante la giornata per energia costante</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-orange-500">•</span>
            <span>Include grassi sani come olio d'oliva, noci e avocado</span>
          </div>
        </div>
      </Card>

      {/* Weekly Overview */}
      {selectedDate === new Date().toISOString().slice(0, 10) && (
        <Card glass padding="lg">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            📈 Panoramica Settimanale
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-700">
                {Math.round(summary.consumed.calories / (summary.totals.calories / 100))}%
              </div>
              <div className="text-sm text-slate-500">Obiettivo Calorico Medio</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-700">
                {Math.round((waterIntake / targetWater) * 100)}%
              </div>
              <div className="text-sm text-slate-500">Idratazione Media</div>
            </div>
          </div>
        </Card>
      )}

      {/* Meal Form Modal */}
      <MealForm
        isOpen={showMealForm}
        onClose={() => {
          setShowMealForm(false);
          setEditingMeal(null);
        }}
        onSave={handleSaveMeal}
        initialMeal={editingMeal}
      />
    </div>
  );
};

export default NutritionScreen;