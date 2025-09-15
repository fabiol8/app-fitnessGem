import React from 'react';
import { Card, ProgressBar } from '../../../components/ui';
import { calculateWeightLossProgress, calculateTimelineProgress } from '../../../utils/calculations';
import { formatDate } from '../../../utils/dateTime';

const ProgressChart = ({
  user,
  weeklyData = [],
  className = ''
}) => {
  const currentWeight = weeklyData.length > 0
    ? weeklyData[weeklyData.length - 1].weight
    : user.startWeight;

  const weightProgress = calculateWeightLossProgress(
    user.startWeight,
    currentWeight,
    user.goalWeight
  );

  const timelineProgress = calculateTimelineProgress(
    user.startDate,
    user.endDate
  );

  const intermediateProgress = user.intermediateGoalWeight
    ? calculateWeightLossProgress(user.startWeight, currentWeight, user.intermediateGoalWeight)
    : null;

  return (
    <Card padding="lg" className={className}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Progresso Obiettivi
      </h3>

      <div className="space-y-6">
        {/* Weight Loss Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Perdita Peso
            </span>
            <span className="text-sm text-gray-500">
              {weightProgress.lost}kg / {weightProgress.total}kg
            </span>
          </div>

          <ProgressBar
            value={weightProgress.percentage}
            variant={weightProgress.percentage > 75 ? 'success' : 'primary'}
            size="lg"
            showLabel
            label={`${weightProgress.percentage}%`}
          />

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{user.startWeight}kg</span>
            <span className="font-medium">{currentWeight}kg</span>
            <span>{user.goalWeight}kg</span>
          </div>
        </div>

        {/* Intermediate Goal */}
        {intermediateProgress && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Obiettivo Intermedio
              </span>
              <span className="text-sm text-gray-500">
                Target: {user.intermediateGoalWeight}kg
              </span>
            </div>

            <ProgressBar
              value={intermediateProgress.percentage}
              variant={intermediateProgress.percentage >= 100 ? 'success' : 'warning'}
              size="md"
              showLabel
              label={`${intermediateProgress.percentage}%`}
            />

            {intermediateProgress.percentage >= 100 && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                🎉 Obiettivo intermedio raggiunto!
              </p>
            )}
          </div>
        )}

        {/* Timeline Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progresso Temporale
            </span>
            <span className="text-sm text-gray-500">
              {timelineProgress.daysElapsed} / {timelineProgress.totalDays} giorni
            </span>
          </div>

          <ProgressBar
            value={timelineProgress.percentage}
            variant="info"
            size="md"
            showLabel
            label={`${timelineProgress.percentage}%`}
          />

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatDate(user.startDate, 'DD/MM')}</span>
            <span className="font-medium">
              {timelineProgress.daysRemaining} giorni rimanenti
            </span>
            <span>{formatDate(user.endDate, 'DD/MM')}</span>
          </div>
        </div>

        {/* Weight History Chart (Simple) */}
        {weeklyData.length > 1 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Storico Peso (Ultime {Math.min(weeklyData.length, 8)} Settimane)
            </h4>

            <div className="space-y-2">
              {weeklyData.slice(-8).map((entry, index) => {
                const isLatest = index === weeklyData.slice(-8).length - 1;
                const trend = index > 0
                  ? entry.weight - weeklyData.slice(-8)[index - 1].weight
                  : 0;

                return (
                  <div key={entry.date} className="flex items-center justify-between text-sm">
                    <span className={`${isLatest ? 'font-semibold' : 'text-gray-600'}`}>
                      {formatDate(entry.date, 'DD/MM')}
                    </span>

                    <div className="flex items-center space-x-2">
                      <span className={`${isLatest ? 'font-semibold' : ''}`}>
                        {entry.weight}kg
                      </span>

                      {trend !== 0 && (
                        <span className={`text-xs ${
                          trend < 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trend > 0 ? '+' : ''}{trend.toFixed(1)}kg
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {weightProgress.remaining.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">kg rimanenti</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {timelineProgress.daysRemaining}
            </p>
            <p className="text-xs text-gray-500">giorni al traguardo</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProgressChart;