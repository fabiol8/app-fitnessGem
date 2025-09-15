import React, { useState } from 'react';
import { Card } from '../../../components/ui';
import ExerciseCard from './ExerciseCard';
import { formatDate } from '../../../utils/dateTime';

const WorkoutDayCard = ({
  date,
  dayPlan,
  isToday = false,
  progress = {},
  onProgressUpdate,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(isToday);

  const totalCaloriesBurned = dayPlan.workout?.exercises.reduce((total, exercise) => {
    const baseId = `workout_${dayPlan.dayName}_${exercise.name.replace(/\s+/g, '_')}`;
    const completedId = `${baseId}_completed`;
    if (progress[completedId]) {
      return total + (exercise.calories || 0);
    }
    return total;
  }, 0) || 0;

  const completedExercises = dayPlan.workout?.exercises.filter(exercise => {
    const baseId = `workout_${dayPlan.dayName}_${exercise.name.replace(/\s+/g, '_')}`;
    const completedId = `${baseId}_completed`;
    return !!progress[completedId];
  }).length || 0;

  const totalExercises = dayPlan.workout?.exercises.length || 0;
  const completionPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  const getDateInfo = () => {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    return {
      dayName: dayNames[date.getDay()],
      dateStr: formatDate(date, 'DD/MM'),
      fullDate: formatDate(date, 'DD MMMM YYYY')
    };
  };

  const dateInfo = getDateInfo();

  return (
    <Card
      padding="none"
      className={`transition-all duration-200 ${
        isToday ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
      } ${className}`}
    >
      {/* Header */}
      <div
        className={`p-4 cursor-pointer ${
          isToday ? 'bg-blue-100' : 'bg-gray-50'
        } rounded-t-xl`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`text-center ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
              <div className="text-xs font-medium">{dateInfo.dayName}</div>
              <div className="text-lg font-bold">{dateInfo.dateStr}</div>
            </div>

            <div>
              <h3 className={`font-semibold ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                {dayPlan.dayName}
              </h3>
              <p className={`text-sm ${isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                {dayPlan.workout?.focus || 'Giorno di riposo'}
              </p>
            </div>

            {isToday && (
              <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full font-medium">
                Oggi
              </span>
            )}
          </div>

          <div className="text-right">
            {dayPlan.workout ? (
              <div className="space-y-1">
                <div className={`text-sm font-medium ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                  {completedExercises}/{totalExercises} esercizi
                </div>

                {totalCaloriesBurned > 0 && (
                  <div className={`text-xs ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                    🔥 {totalCaloriesBurned} cal
                  </div>
                )}

                {/* Progress Bar */}
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      completionPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className={`text-sm ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                💤 Riposo
              </div>
            )}

            <div className={`text-xs mt-1 ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
              {isExpanded ? '▲' : '▼'}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && dayPlan.workout && (
        <div className="p-4 space-y-4">
          {/* Workout Info */}
          <div className={`p-3 rounded-lg ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <h4 className="font-medium text-gray-800 mb-1">
              {dayPlan.workout.focus}
            </h4>
            <div className="text-sm text-gray-600">
              {dayPlan.workout.exercises.length} esercizi
              {totalExercises > 0 && ` • ${Math.round(completionPercentage)}% completato`}
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-3">
            {dayPlan.workout.exercises.map((exercise, index) => {
              const baseId = `workout_${dayPlan.dayName}_${exercise.name.replace(/\s+/g, '_')}`;
              const completedId = `${baseId}_completed`;
              const isExerciseCompleted = !!progress[completedId];

              return (
                <ExerciseCard
                  key={index}
                  exercise={exercise}
                  baseId={baseId}
                  progress={progress}
                  onProgressUpdate={onProgressUpdate}
                  isCompleted={isExerciseCompleted}
                />
              );
            })}
          </div>

          {/* Workout Summary */}
          {completedExercises > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progressi di oggi:</span>
                <span className="font-medium">
                  {completedExercises}/{totalExercises} esercizi
                  {totalCaloriesBurned > 0 && ` • ${totalCaloriesBurned} cal`}
                </span>
              </div>

              {completionPercentage === 100 && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-center">
                  <span className="text-green-700 font-medium">
                    🎉 Workout completato! Ottimo lavoro!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default WorkoutDayCard;