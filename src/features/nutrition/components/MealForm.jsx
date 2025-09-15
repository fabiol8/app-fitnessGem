import React, { useState } from 'react';
import { Card, Button, Input, Modal } from '../../../components/ui';

const MealForm = ({
  isOpen = false,
  onClose,
  onSave,
  initialMeal = null,
  className = ''
}) => {
  const [meal, setMeal] = useState(initialMeal || {
    type: 'breakfast',
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    time: new Date().toTimeString().slice(0, 5),
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const mealTypes = [
    { value: 'breakfast', label: 'Colazione', icon: '🌅' },
    { value: 'snack-morning', label: 'Spuntino Mattina', icon: '☕' },
    { value: 'lunch', label: 'Pranzo', icon: '🍽️' },
    { value: 'snack-afternoon', label: 'Spuntino Pomeriggio', icon: '🍎' },
    { value: 'dinner', label: 'Cena', icon: '🌙' },
    { value: 'snack-evening', label: 'Spuntino Sera', icon: '🍯' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!meal.name.trim()) {
      newErrors.name = 'Nome del pasto richiesto';
    }

    if (!meal.calories || meal.calories <= 0) {
      newErrors.calories = 'Calorie devono essere maggiori di 0';
    }

    if (!meal.protein || meal.protein < 0) {
      newErrors.protein = 'Proteine non possono essere negative';
    }

    if (!meal.carbs || meal.carbs < 0) {
      newErrors.carbs = 'Carboidrati non possono essere negativi';
    }

    if (!meal.fats || meal.fats < 0) {
      newErrors.fats = 'Grassi non possono essere negativi';
    }

    // Check if macros add up reasonably to calories
    const calculatedCalories = (parseFloat(meal.protein) * 4) +
                              (parseFloat(meal.carbs) * 4) +
                              (parseFloat(meal.fats) * 9);

    const caloriesDiff = Math.abs(calculatedCalories - parseFloat(meal.calories));
    const tolerance = parseFloat(meal.calories) * 0.2; // 20% tolerance

    if (caloriesDiff > tolerance) {
      newErrors.macros = 'Le calorie dai macronutrienti non corrispondono al totale';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const mealData = {
        ...meal,
        calories: parseFloat(meal.calories),
        protein: parseFloat(meal.protein),
        carbs: parseFloat(meal.carbs),
        fats: parseFloat(meal.fats),
        id: initialMeal?.id || Date.now(),
        createdAt: initialMeal?.createdAt || new Date(),
        updatedAt: new Date()
      };

      onSave(mealData);
      handleClose();
    }
  };

  const handleClose = () => {
    setMeal(initialMeal || {
      type: 'breakfast',
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      time: new Date().toTimeString().slice(0, 5),
      notes: ''
    });
    setErrors({});
    onClose();
  };

  const calculateMacroCalories = () => {
    const protein = parseFloat(meal.protein) || 0;
    const carbs = parseFloat(meal.carbs) || 0;
    const fats = parseFloat(meal.fats) || 0;

    return (protein * 4) + (carbs * 4) + (fats * 9);
  };

  const getSelectedMealType = () => {
    return mealTypes.find(type => type.value === meal.type) || mealTypes[0];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      className={className}
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            {initialMeal ? 'Modifica Pasto' : 'Aggiungi Pasto'}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
          >
            ✕
          </Button>
        </div>

        {/* Meal Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tipo di Pasto
          </label>
          <div className="grid grid-cols-3 gap-2">
            {mealTypes.map((type) => (
              <Button
                key={type.value}
                type="button"
                variant={meal.type === type.value ? 'primary' : 'ghost'}
                size="sm"
                className="text-center p-2"
                onClick={() => setMeal({ ...meal, type: type.value })}
              >
                <div>
                  <div className="text-lg mb-1">{type.icon}</div>
                  <div className="text-xs">{type.label}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Meal Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2">
            <Input
              label="Nome del Pasto"
              value={meal.name}
              onChange={(e) => setMeal({ ...meal, name: e.target.value })}
              placeholder="es. Pasta al pomodoro"
              error={errors.name}
              required
            />
          </div>

          <Input
            label="Orario"
            type="time"
            value={meal.time}
            onChange={(e) => setMeal({ ...meal, time: e.target.value })}
          />

          <Input
            label="Calorie Totali"
            type="number"
            value={meal.calories}
            onChange={(e) => setMeal({ ...meal, calories: e.target.value })}
            placeholder="450"
            error={errors.calories}
            required
            unit="kcal"
          />
        </div>

        {/* Macronutrients */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Macronutrienti</h3>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Proteine"
              type="number"
              step="0.1"
              value={meal.protein}
              onChange={(e) => setMeal({ ...meal, protein: e.target.value })}
              placeholder="25.0"
              error={errors.protein}
              required
              unit="g"
            />

            <Input
              label="Carboidrati"
              type="number"
              step="0.1"
              value={meal.carbs}
              onChange={(e) => setMeal({ ...meal, carbs: e.target.value })}
              placeholder="60.0"
              error={errors.carbs}
              required
              unit="g"
            />

            <Input
              label="Grassi"
              type="number"
              step="0.1"
              value={meal.fats}
              onChange={(e) => setMeal({ ...meal, fats: e.target.value })}
              placeholder="15.0"
              error={errors.fats}
              required
              unit="g"
            />
          </div>

          {/* Macro Validation */}
          {meal.protein && meal.carbs && meal.fats && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Calorie dai macros:</span>
                <span className="font-medium text-blue-800">
                  {Math.round(calculateMacroCalories())} kcal
                </span>
              </div>
              {meal.calories && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-blue-700">Differenza:</span>
                  <span className={`font-medium ${
                    Math.abs(calculateMacroCalories() - parseFloat(meal.calories)) > parseFloat(meal.calories) * 0.2
                      ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {Math.round(calculateMacroCalories() - parseFloat(meal.calories))} kcal
                  </span>
                </div>
              )}
            </div>
          )}

          {errors.macros && (
            <div className="mt-2 text-sm text-red-600">
              {errors.macros}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Note (opzionale)
          </label>
          <textarea
            value={meal.notes}
            onChange={(e) => setMeal({ ...meal, notes: e.target.value })}
            placeholder="Ingredienti, sensazioni, note varie..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="flex-1"
          >
            {initialMeal ? 'Aggiorna Pasto' : 'Salva Pasto'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={handleClose}
          >
            Annulla
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MealForm;