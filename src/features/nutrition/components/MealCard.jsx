import React from 'react';
import { Card, Button } from '../../../components/ui';

const MealCard = ({
  meal,
  onEdit,
  onDelete,
  className = ''
}) => {
  if (!meal) return null;

  const totalCalories = meal.foods?.reduce((total, food) => total + (food.calories || 0), 0) || 0;
  const totalProtein = meal.foods?.reduce((total, food) => total + (food.protein || 0), 0) || 0;
  const totalCarbs = meal.foods?.reduce((total, food) => total + (food.carbs || 0), 0) || 0;
  const totalFat = meal.foods?.reduce((total, food) => total + (food.fat || 0), 0) || 0;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{meal.name}</h3>
          <p className="text-sm text-gray-600">{meal.time}</p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(meal)}
            >
              Modifica
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(meal.id)}
              className="text-red-600 hover:text-red-700"
            >
              Elimina
            </Button>
          )}
        </div>
      </div>

      {meal.foods && meal.foods.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Alimenti:</h4>
          <ul className="space-y-1">
            {meal.foods.map((food, index) => (
              <li key={index} className="text-sm text-gray-600 flex justify-between">
                <span>{food.name} {food.quantity && `(${food.quantity})`}</span>
                <span>{food.calories || 0} cal</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-blue-600">{totalCalories}</p>
          <p className="text-xs text-gray-500">Calorie</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600">{totalProtein.toFixed(1)}g</p>
          <p className="text-xs text-gray-500">Proteine</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-orange-600">{totalCarbs.toFixed(1)}g</p>
          <p className="text-xs text-gray-500">Carboidrati</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-purple-600">{totalFat.toFixed(1)}g</p>
          <p className="text-xs text-gray-500">Grassi</p>
        </div>
      </div>

      {meal.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{meal.notes}</p>
        </div>
      )}
    </Card>
  );
};

export default MealCard;