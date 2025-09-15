import React from 'react';
import { Card } from '../../../components/ui';
import { useCountdown, useDaysUntilNextMonday } from '../../../hooks';

const CountdownCards = ({ user, className = '' }) => {
  const daysToGoal = useCountdown(user.endDate);
  const daysToNextMeasurement = useDaysUntilNextMonday();

  const cards = [
    {
      title: 'Prossima Misurazione',
      value: daysToNextMeasurement,
      unit: daysToNextMeasurement === 1 ? 'giorno' : 'giorni',
      icon: '📏',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Traguardo Finale',
      value: typeof daysToGoal.days === 'number' ? daysToGoal.days : daysToGoal,
      unit: typeof daysToGoal.days === 'number' ? 'giorni' : '',
      icon: '🎯',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      {cards.map((card, index) => (
        <Card
          key={index}
          glass
          padding="md"
          className="text-center"
        >
          <div className="flex justify-center mb-2">
            <span className="text-2xl">{card.icon}</span>
          </div>

          <p className="text-sm font-semibold text-slate-600 mb-1">
            {card.title}
          </p>

          <p className={`text-3xl font-bold ${card.color} mb-1`}>
            {card.value}
          </p>

          <p className="text-xs text-slate-500">
            {card.unit}
          </p>

          {/* Progress indicator for goal */}
          {card.title === 'Traguardo Finale' && typeof card.value === 'number' && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-purple-500 h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, 100 - (card.value / (user.durationWeeks * 7)) * 100))}%`
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {Math.round(Math.max(0, Math.min(100, 100 - (card.value / (user.durationWeeks * 7)) * 100)))}% completato
              </p>
            </div>
          )}

          {/* Measurement reminder */}
          {card.title === 'Prossima Misurazione' && card.value <= 1 && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700 font-medium">
                📅 Misurazione dovuta!
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default CountdownCards;