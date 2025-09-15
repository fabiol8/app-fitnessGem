import React, { useState } from 'react';
import { Card, Button, ProgressBar } from '../../../components/ui';

const MealCard = ({
  meal,
  onEdit,
  onDelete,
  onToggleComplete,
  showMacros = true,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getMealTypeInfo = (type) => {
    const mealTypes = {
      'breakfast': { label: 'Colazione', icon: '🌅', color: 'text-orange-600' },
      'snack-morning': { label: 'Spuntino Mattina', icon: '☕', color: 'text-amber-600' },
      'lunch': { label: 'Pranzo', icon: '🍽️', color: 'text-blue-600' },
      'snack-afternoon': { label: 'Spuntino Pomeriggio', icon: '🍎', color: 'text-green-600' },
      'dinner': { label: 'Cena', icon: '🌙', color: 'text-purple-600' },
      'snack-evening': { label: 'Spuntino Sera', icon: '🍯', color: 'text-indigo-600' }
    };

    return mealTypes[type] || { label: 'Pasto', icon: '🍽️', color: 'text-slate-600' };
  };

  const typeInfo = getMealTypeInfo(meal.type);

  const getMacroPercentage = (macro, total) => {
    if (total === 0) return 0;
    return Math.round((macro / total) * 100);
  };

  const calculateMacroCalories = () => {
    return (meal.protein * 4) + (meal.carbs * 4) + (meal.fats * 9);
  };

  const getMacroDistribution = () => {
    const totalMacroCalories = calculateMacroCalories();
    return {
      protein: getMacroPercentage(meal.protein * 4, totalMacroCalories),
      carbs: getMacroPercentage(meal.carbs * 4, totalMacroCalories),
      fats: getMacroPercentage(meal.fats * 9, totalMacroCalories)
    };
  };

  const distribution = getMacroDistribution();

  return (
    <Card
      glass
      padding="md"
      className={`${className} ${meal.completed ? 'opacity-75' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-xl">{typeInfo.icon}</span>
          <div>
            <h3 className={`font-semibold ${typeInfo.color}`}>
              {typeInfo.label}
            </h3>
            <p className="text-sm text-slate-600">{meal.time}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleComplete(meal.id)}
          >
            {meal.completed ? '✅' : '⭕'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
          >
            ✏️
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
          >
            🗑️
          </Button>
        </div>
      </div>

      {/* Meal Name and Calories */}
      <div className="mb-3">
        <h4 className={`font-medium text-slate-700 ${meal.completed ? 'line-through' : ''}`}>
          {meal.name}
        </h4>
        <div className="flex items-center justify-between mt-1">
          <span className="text-lg font-bold text-slate-800">
            {meal.calories} kcal
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '👁️‍🗨️ Nascondi' : '👁️ Dettagli'}
          </Button>
        </div>
      </div>

      {/* Quick Macros Summary */}
      {showMacros && (
        <div className="grid grid-cols-3 gap-3 text-center text-sm mb-3">
          <div>
            <div className="font-semibold text-green-600">{meal.protein}g</div>
            <div className="text-xs text-slate-500">Proteine</div>
          </div>
          <div>
            <div className="font-semibold text-amber-600">{meal.carbs}g</div>
            <div className="text-xs text-slate-500">Carboidrati</div>
          </div>
          <div>
            <div className="font-semibold text-blue-600">{meal.fats}g</div>
            <div className="text-xs text-slate-500">Grassi</div>
          </div>
        </div>
      )}

      {/* Detailed View */}
      {showDetails && (
        <div className="border-t border-white/20 pt-3 space-y-3">
          {/* Macro Distribution */}
          <div>
            <h5 className="text-sm font-medium text-slate-600 mb-2">
              Distribuzione Macronutrienti
            </h5>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-green-700">Proteine ({distribution.protein}%)</span>
                  <span>{meal.protein}g • {Math.round(meal.protein * 4)} kcal</span>
                </div>
                <ProgressBar
                  value={distribution.protein}
                  variant="success"
                  size="sm"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-700">Carboidrati ({distribution.carbs}%)</span>
                  <span>{meal.carbs}g • {Math.round(meal.carbs * 4)} kcal</span>
                </div>
                <ProgressBar
                  value={distribution.carbs}
                  variant="warning"
                  size="sm"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-700">Grassi ({distribution.fats}%)</span>
                  <span>{meal.fats}g • {Math.round(meal.fats * 9)} kcal</span>
                </div>
                <ProgressBar
                  value={distribution.fats}
                  variant="info"
                  size="sm"
                />
              </div>
            </div>

            {/* Calorie Verification */}
            <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
              <div className="flex justify-between">
                <span>Calorie dichiarate:</span>
                <span className="font-medium">{meal.calories} kcal</span>
              </div>
              <div className="flex justify-between">
                <span>Calorie dai macros:</span>
                <span className="font-medium">{Math.round(calculateMacroCalories())} kcal</span>
              </div>
              <div className="flex justify-between">
                <span>Differenza:</span>
                <span className={`font-medium ${
                  Math.abs(calculateMacroCalories() - meal.calories) > meal.calories * 0.1
                    ? 'text-red-600' : 'text-green-600'
                }`}>
                  {Math.round(calculateMacroCalories() - meal.calories)} kcal
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {meal.notes && (
            <div>
              <h5 className="text-sm font-medium text-slate-600 mb-1">Note</h5>
              <p className="text-sm text-slate-600 bg-white/20 p-2 rounded">
                {meal.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-slate-400 space-y-1">
            {meal.createdAt && (
              <div>Creato: {new Date(meal.createdAt).toLocaleString('it-IT')}</div>
            )}
            {meal.updatedAt && meal.updatedAt !== meal.createdAt && (
              <div>Modificato: {new Date(meal.updatedAt).toLocaleString('it-IT')}</div>
            )}
          </div>
        </div>
      )}

      {/* Completion Status */}
      {meal.completed && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-700">
            <span>✅</span>
            <span className="text-sm font-medium">Pasto completato</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MealCard;