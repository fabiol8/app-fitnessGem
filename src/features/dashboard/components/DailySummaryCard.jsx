import React from 'react';
import { Card, ProgressBar } from '../../../components/ui';

const DailySummaryCard = ({ summary, className = '' }) => {
  const { totals, consumed, burnedCalories } = summary;
  const remaining = totals.calories - consumed.calories + burnedCalories;

  const getMacroPercentage = (consumed, total) => {
    return total > 0 ? Math.round((consumed / total) * 100) : 0;
  };

  const getCalorieStatus = () => {
    if (remaining > 100) return { color: 'text-blue-600', status: 'Puoi ancora mangiare' };
    if (remaining > 0) return { color: 'text-green-600', status: 'Quasi raggiunto' };
    if (remaining > -100) return { color: 'text-orange-600', status: 'Leggermente sopra' };
    return { color: 'text-red-600', status: 'Sopra il limite' };
  };

  const calorieStatus = getCalorieStatus();

  return (
    <Card
      glass
      padding="lg"
      className={className}
    >
      <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">
        Riepilogo Giornaliero
      </h3>

      {/* Calorie Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">Calorie</span>
          <span className={`text-sm font-semibold ${calorieStatus.color}`}>
            {Math.abs(remaining)} {remaining >= 0 ? 'rimanenti' : 'eccesso'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {consumed.calories}
            </div>
            <div className="text-xs text-slate-500">Consumate</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {burnedCalories}
            </div>
            <div className="text-xs text-slate-500">Bruciate</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {totals.calories}
            </div>
            <div className="text-xs text-slate-500">Target</div>
          </div>
        </div>

        <ProgressBar
          value={Math.min(100, ((consumed.calories - burnedCalories) / totals.calories) * 100)}
          variant={remaining >= 0 ? 'primary' : 'warning'}
          size="md"
          showLabel
        />

        <p className={`text-xs text-center mt-2 ${calorieStatus.color}`}>
          {calorieStatus.status}
        </p>
      </div>

      {/* Macros Section */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Proteine</span>
            <span className="font-medium">
              {consumed.protein}g / {totals.protein}g
            </span>
          </div>
          <ProgressBar
            value={getMacroPercentage(consumed.protein, totals.protein)}
            variant="success"
            size="sm"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Carboidrati</span>
            <span className="font-medium">
              {consumed.carbs}g / {totals.carbs}g
            </span>
          </div>
          <ProgressBar
            value={getMacroPercentage(consumed.carbs, totals.carbs)}
            variant="warning"
            size="sm"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Grassi</span>
            <span className="font-medium">
              {consumed.fats}g / {totals.fats}g
            </span>
          </div>
          <ProgressBar
            value={getMacroPercentage(consumed.fats, totals.fats)}
            variant="info"
            size="sm"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm font-semibold text-slate-700">
              {Math.round(((consumed.protein * 4 + consumed.carbs * 4 + consumed.fats * 9) / consumed.calories) * 100) || 0}%
            </div>
            <div className="text-xs text-slate-500">Precisione Macro</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-700">
              {Math.round((consumed.calories / totals.calories) * 100)}%
            </div>
            <div className="text-xs text-slate-500">Obiettivo Giorno</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DailySummaryCard;