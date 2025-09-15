import React, { useState } from 'react';
import { Card, Button, Input } from '../../../components/ui';

const ExerciseCard = ({
  exercise,
  baseId,
  progress = {},
  onProgressUpdate,
  isCompleted = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse sets info (es. "3x10-12" -> { sets: 3, reps: "10-12" })
  const parseSets = (setsString) => {
    if (!setsString) return { sets: 1, reps: '' };

    const match = setsString.match(/(\d+)x?(.+)?/);
    if (match) {
      return {
        sets: parseInt(match[1]),
        reps: match[2] || ''
      };
    }
    return { sets: 1, reps: setsString };
  };

  const setInfo = parseSets(exercise.sets);
  const isCircuit = exercise.type === 'circuit';
  const isCardio = exercise.type === 'cardio';
  const completedId = `${baseId}_completed`;

  // Generate IDs for different inputs
  const weightId = `${baseId}_weight`;
  const repsId = `${baseId}_reps`;
  const levelId = `${baseId}_level`;

  const handleSetCompletion = (setIndex, completed) => {
    const setId = `${baseId}_set_${setIndex}`;
    onProgressUpdate(setId, completed);
  };

  const handleMainCompletion = (completed) => {
    onProgressUpdate(completedId, completed);
  };

  const renderSetTracking = () => {
    if (isCardio || setInfo.sets <= 1) return null;

    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-600 mb-2">Serie:</p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: setInfo.sets }).map((_, i) => {
            const setId = `${baseId}_set_${i}`;
            const isSetCompleted = !!progress[setId];

            return (
              <div key={setId} className="flex items-center">
                <input
                  type="checkbox"
                  id={setId}
                  checked={isSetCompleted}
                  onChange={(e) => handleSetCompletion(i, e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={setId} className="ml-1.5 text-sm text-gray-700">
                  {i + 1}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderExerciseInputs = () => {
    return (
      <div className="space-y-3">
        {/* Weight tracking for strength exercises */}
        {exercise.type === 'weights' && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Peso"
              type="number"
              step="0.5"
              value={progress[weightId] || ''}
              onChange={(e) => onProgressUpdate(weightId, e.target.value)}
              unit="kg"
              size="sm"
              placeholder="0"
            />
            <Input
              label="Ripetizioni"
              type="number"
              value={progress[repsId] || ''}
              onChange={(e) => onProgressUpdate(repsId, e.target.value)}
              placeholder={setInfo.reps || '12'}
              size="sm"
            />
          </div>
        )}

        {/* Level tracking for cardio */}
        {exercise.name === 'CYCLETTE' && (
          <Input
            label="Livello"
            type="number"
            value={progress[levelId] || ''}
            onChange={(e) => onProgressUpdate(levelId, e.target.value)}
            placeholder="0"
            size="sm"
          />
        )}
      </div>
    );
  };

  const renderCircuitDetails = () => {
    if (!isCircuit || !exercise.details) return null;

    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-600 mb-2">Dettagli Circuito:</p>
        <div className="space-y-2">
          {exercise.details.map((detail, i) => (
            <div key={i} className="text-sm text-gray-700 flex items-center">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mr-2">
                {i + 1}
              </span>
              {detail.name ? `${detail.name} (${detail.sets})` : detail}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card
      padding="md"
      className={`transition-all duration-200 ${
        isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-md'
      } ${className}`}
    >
      {/* Exercise Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              {exercise.type}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{exercise.sets}</span>
            {exercise.calories && (
              <span className="flex items-center">
                🔥 {exercise.calories} cal
              </span>
            )}
          </div>
        </div>

        {/* Completion Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id={completedId}
            checked={isCompleted}
            onChange={(e) => handleMainCompletion(e.target.checked)}
            className="h-5 w-5 rounded text-green-600 border-gray-300 focus:ring-green-500"
          />
          <label htmlFor={completedId} className="ml-2 text-sm text-gray-700">
            Completato
          </label>
        </div>
      </div>

      {/* Exercise Inputs */}
      {!isCompleted && renderExerciseInputs()}

      {/* Set Tracking */}
      {!isCompleted && renderSetTracking()}

      {/* Expandable Details */}
      {(exercise.details || exercise.description) && (
        <div className="mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? '▲ Nascondi dettagli' : '▼ Mostra dettagli'}
          </Button>

          {isExpanded && (
            <div className="mt-2">
              {exercise.description && (
                <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
              )}
              {renderCircuitDetails()}
            </div>
          )}
        </div>
      )}

      {/* Completion Feedback */}
      {isCompleted && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <div className="flex items-center text-green-700">
            <span className="text-green-600 mr-2">✅</span>
            <span className="text-sm font-medium">Esercizio completato!</span>
            {exercise.calories && (
              <span className="ml-auto text-sm">+{exercise.calories} cal</span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ExerciseCard;