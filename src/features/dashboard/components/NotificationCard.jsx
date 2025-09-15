import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../../components/ui';
import { formatDate, getTimeGreeting } from '../../../utils/dateTime';

const NotificationCard = ({
  user,
  progress = {},
  updateProgress,
  fastingDays = {},
  className = ''
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const today = new Date();
  const dateString = today.toISOString().slice(0, 10);
  const isFastingDay = !!fastingDays[dateString];

  // Get daily schedule for today
  const dailySchedule = [
    { time: "06:30", type: "meditation", title: "Meditazione & Attivazione", icon: "🧘" },
    { time: "07:00", type: "hydration", title: "Idratazione Mattutina", icon: "💧" },
    { time: "07:15", type: "activity", title: "Passeggiata con il cane", icon: "🐾" },
    { time: "08:15", type: "supplement", title: "Integratori Mattutini", icon: "💊" },
    { time: "13:30", type: "meal", title: "Pranzo", icon: "🍽️" },
    { time: "16:00", type: "meal", title: "Spuntino", icon: "🧠" },
    { time: "19:15", type: "supplement", title: "Pre-Workout", icon: "💪" },
    { time: "20:00", type: "workout", title: "Workout", icon: "🏋️‍♂️" },
    { time: "21:15", type: "meal", title: "Cena", icon: "🍲" },
    { time: "23:00", type: "supplement", title: "Recupero Notturno", icon: "🌙" }
  ];

  const getActivityStatus = (time) => {
    const now = currentTime;
    const activityTime = new Date();
    const [hours, minutes] = time.split(':');
    activityTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const diffMinutes = (now - activityTime) / (1000 * 60);

    if (diffMinutes < -60) return 'upcoming';
    if (diffMinutes < 0) return 'soon';
    if (diffMinutes <= 60) return 'due';
    return 'overdue';
  };

  const getNextActivity = () => {
    const now = currentTime;
    return dailySchedule.find(activity => {
      const activityTime = new Date();
      const [hours, minutes] = activity.time.split(':');
      activityTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return activityTime > now;
    }) || dailySchedule[0]; // If all activities are past, show first one for tomorrow
  };

  const getCurrentActivity = () => {
    return dailySchedule.find(activity => {
      const status = getActivityStatus(activity.time);
      return status === 'due';
    });
  };

  const nextActivity = getNextActivity();
  const currentActivity = getCurrentActivity();

  const markActivityComplete = (activity) => {
    const key = `activity_${dateString}_${activity.time.replace(':', '')}_${activity.type}`;
    updateProgress(key, true);
  };

  const isActivityCompleted = (activity) => {
    const key = `activity_${dateString}_${activity.time.replace(':', '')}_${activity.type}`;
    return !!progress[key];
  };

  return (
    <Card
      glass
      padding="lg"
      className={className}
    >
      {/* Greeting and Date */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-slate-700 mb-1">
          {getTimeGreeting()}, {user.name}! 👋
        </h3>
        <p className="text-sm text-slate-500">
          {formatDate(today, 'dddd, DD MMMM YYYY')}
        </p>
      </div>

      {/* Current Activity */}
      {currentActivity && !isActivityCompleted(currentActivity) && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl">{currentActivity.icon}</span>
              <div>
                <p className="font-medium text-yellow-800">{currentActivity.title}</p>
                <p className="text-xs text-yellow-600">Ore {currentActivity.time}</p>
              </div>
            </div>
            <Button
              variant="success"
              size="sm"
              onClick={() => markActivityComplete(currentActivity)}
            >
              ✓ Fatto
            </Button>
          </div>
        </div>
      )}

      {/* Next Activity */}
      {nextActivity && !currentActivity && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{nextActivity.icon}</span>
            <div>
              <p className="font-medium text-blue-800">Prossima attività</p>
              <p className="text-sm text-blue-700">{nextActivity.title}</p>
              <p className="text-xs text-blue-600">Ore {nextActivity.time}</p>
            </div>
          </div>
        </div>
      )}

      {/* Fasting Status */}
      {isFastingDay && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-xl">⏰</span>
            <div>
              <p className="font-medium text-purple-800">Giorno di Digiuno</p>
              <p className="text-sm text-purple-700">Finestra alimentare limitata</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-600 mb-2">Azioni Rapide</h4>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs p-2 h-auto"
            onClick={() => {
              // Navigate to workout screen
              console.log('Navigate to workout');
            }}
          >
            <div className="text-center">
              <div className="text-lg mb-1">🏋️‍♂️</div>
              <div>Workout</div>
            </div>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs p-2 h-auto"
            onClick={() => {
              // Navigate to progress screen
              console.log('Navigate to progress');
            }}
          >
            <div className="text-center">
              <div className="text-lg mb-1">📊</div>
              <div>Progressi</div>
            </div>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs p-2 h-auto"
            onClick={() => {
              // Quick meditation
              console.log('Start quick meditation');
            }}
          >
            <div className="text-center">
              <div className="text-lg mb-1">🧘</div>
              <div>Meditazione</div>
            </div>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs p-2 h-auto"
            onClick={() => {
              // Add meal
              console.log('Add meal');
            }}
          >
            <div className="text-center">
              <div className="text-lg mb-1">🍽️</div>
              <div>Aggiungi Pasto</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Daily Completion Status */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Attività completate</span>
          <span className="text-sm font-medium text-slate-700">
            {dailySchedule.filter(activity => isActivityCompleted(activity)).length}/{dailySchedule.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(dailySchedule.filter(activity => isActivityCompleted(activity)).length / dailySchedule.length) * 100}%`
            }}
          />
        </div>
      </div>
    </Card>
  );
};

export default NotificationCard;