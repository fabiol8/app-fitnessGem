import React from 'react';
import { Card } from '../../../components/ui';

const ExerciseCard = ({
  exercise,
  progress = {},
  onProgressUpdate,
  dayName,
  className = ''
}) => {
  if (!exercise) return null;

  const baseId = `workout_${dayName}_${exercise.name.replace(/\s+/g, '_')}`;
  const completedId = `${baseId}_completed`;
  const isCompleted = progress[completedId] || false;

  const handleToggleComplete = () => {
    if (onProgressUpdate) {
      onProgressUpdate(completedId, !isCompleted);
    }
  };

  return (
    <Card className={`p-4 ${className} ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{exercise.name}</h4>
          <div className="text-sm text-gray-600 mt-1">
            {exercise.sets && <span>{exercise.sets} serie</span>}
            {exercise.reps && <span> × {exercise.reps} ripetizioni</span>}
            {exercise.duration && <span>{exercise.duration}</span>}
            {exercise.calories && <span className="ml-2">=% {exercise.calories} cal</span>}
          </div>
          {exercise.description && (
            <p className="text-sm text-gray-500 mt-2">{exercise.description}</p>
          )}
        </div>
        <button
          onClick={handleToggleComplete}
          className={`ml-4 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {isCompleted && ''}
        </button>
      </div>
    </Card>
  );
};

export default ExerciseCard;