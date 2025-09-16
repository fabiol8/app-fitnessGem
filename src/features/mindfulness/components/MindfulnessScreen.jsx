import React, { useState } from 'react';
import { Card, Button, ProgressBar } from '../../../components/ui';
import BreathingTimer from './BreathingTimer';
import RescueBreathing from './RescueBreathing';
import MeditationPlayer from './MeditationPlayer';

const MindfulnessScreen = ({
  user,
  progress = {},
  updateProgress,
  className = ''
}) => {
  const [activeSession, setActiveSession] = useState(null);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showRescueBreathing, setShowRescueBreathing] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  // Get today's mindfulness activities
  const getTodaysMindfulness = () => {
    const activities = Object.entries(progress)
      .filter(([key]) => key.includes(today) && (key.includes('meditation_') || key.includes('breathing_')))
      .map(([key, data]) => ({
        key,
        type: key.includes('meditation_') ? 'meditation' : 'breathing',
        ...data
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return activities;
  };

  // Calculate daily mindfulness stats
  const getDailyStats = () => {
    const activities = getTodaysMindfulness();
    const totalMinutes = activities.reduce((sum, activity) => sum + (activity.duration || 0), 0);
    const sessionCount = activities.length;
    const targetSessions = 2; // Daily goal

    return {
      totalMinutes,
      sessionCount,
      targetSessions,
      completionPercentage: Math.round((sessionCount / targetSessions) * 100)
    };
  };

  // Get weekly overview
  const getWeeklyOverview = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyActivities = Object.entries(progress)
      .filter(([key]) => {
        const match = key.match(/_(\d{4}-\d{2}-\d{2})_/);
        if (!match) return false;
        const date = new Date(match[1]);
        return date >= weekAgo;
      })
      .filter(([key]) => key.includes('meditation_') || key.includes('breathing_'));

    return weeklyActivities.length;
  };

  const dailyStats = getDailyStats();
  const weeklyCount = getWeeklyOverview();
  const todaysActivities = getTodaysMindfulness();

  const handleSessionComplete = (type, duration, data = {}) => {
    const timestamp = new Date().toISOString();
    const key = `${type}_${today}_${Date.now()}`;

    const sessionData = {
      type,
      duration,
      timestamp,
      completed: true,
      ...data
    };

    updateProgress(key, sessionData);
    setActiveSession(null);
    setShowBreathing(false);
    setShowRescueBreathing(false);
    setShowMeditation(false);
  };

  const getMotivationalMessage = () => {
    if (dailyStats.sessionCount === 0) {
      return "Inizia la giornata con un momento di pace >Ø";
    } else if (dailyStats.sessionCount >= dailyStats.targetSessions) {
      return "Fantastico! Hai raggiunto l'obiettivo giornaliero (";
    } else {
      return "Ottimo inizio! Una sessione in più per completare l'obiettivo <";
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card glass padding="lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">
              >Ø Mindfulness
            </h1>
            <p className="text-slate-600">
              Trova il tuo equilibrio interiore
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600">
              {dailyStats.totalMinutes}
            </div>
            <div className="text-sm text-slate-500">min oggi</div>
          </div>
        </div>
      </Card>

      {/* Daily Progress */}
      <Card glass padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-700">
            <¯ Progresso Giornaliero
          </h3>
          <span className="text-2xl font-bold text-purple-600">
            {dailyStats.completionPercentage}%
          </span>
        </div>

        <ProgressBar
          value={dailyStats.completionPercentage}
          variant="purple"
          size="lg"
          className="mb-4"
        />

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-slate-700">
              {dailyStats.sessionCount}/{dailyStats.targetSessions}
            </div>
            <div className="text-sm text-slate-500">Sessioni</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-600">
              {dailyStats.totalMinutes}
            </div>
            <div className="text-sm text-slate-500">Minuti</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-600">
              {weeklyCount}
            </div>
            <div className="text-sm text-slate-500">Questa settimana</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <p className="text-center text-purple-700 font-medium">
            {getMotivationalMessage()}
          </p>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowBreathing(true)}
        >
          >Á Respirazione Guidata
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => setShowMeditation(true)}
        >
          >Ø Meditazione
        </Button>
      </div>

      {/* Emergency Section */}
      <Card glass padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-700">
            =¨ In Caso di Ansia
          </h3>
        </div>

        <p className="text-slate-600 mb-4">
          Se ti senti sopraffatto o ansioso, usa queste tecniche di respirazione per calmarti rapidamente.
        </p>

        <Button
          variant="warning"
          size="lg"
          onClick={() => setShowRescueBreathing(true)}
          className="w-full"
        >
          >Á Respirazione di Emergenza (4-7-8)
        </Button>
      </Card>

      {/* Session Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Breathing Card */}
        <Card glass padding="lg">
          <div className="text-center">
            <div className="text-4xl mb-3">>Á</div>
            <h4 className="text-lg font-semibold text-slate-700 mb-2">
              Respirazione
            </h4>
            <p className="text-slate-600 text-sm mb-4">
              Tecniche di respirazione per ridurre stress e ansia
            </p>
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBreathing(true)}
                className="w-full"
              >
                Respirazione 4-4-4
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRescueBreathing(true)}
                className="w-full"
              >
                Tecnica 4-7-8
              </Button>
            </div>
          </div>
        </Card>

        {/* Meditation Card */}
        <Card glass padding="lg">
          <div className="text-center">
            <div className="text-4xl mb-3">>Ø</div>
            <h4 className="text-lg font-semibold text-slate-700 mb-2">
              Meditazione
            </h4>
            <p className="text-slate-600 text-sm mb-4">
              Sessioni guidate per la pace interiore
            </p>
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMeditation(true)}
                className="w-full"
              >
                Meditazione 5 min
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMeditation(true)}
                className="w-full"
              >
                Meditazione 10 min
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Sessions */}
      <Card glass padding="lg">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          =Ë Sessioni di Oggi
        </h3>

        {todaysActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">>Ø</div>
            <p className="text-slate-500 mb-4">
              Nessuna sessione completata oggi
            </p>
            <p className="text-sm text-slate-400">
              Inizia con una sessione di respirazione
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysActivities.map((activity) => (
              <div
                key={activity.key}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {activity.type === 'meditation' ? '>Ø' : '>Á'}
                  </div>
                  <div>
                    <div className="font-medium text-slate-700">
                      {activity.type === 'meditation' ? 'Meditazione' : 'Respirazione'}
                    </div>
                    <div className="text-sm text-slate-500">
                      {new Date(activity.timestamp).toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600">
                    {activity.duration} min
                  </div>
                  <div className="text-sm text-slate-500">
                    Completata
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tips */}
      <Card glass padding="lg">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          =¡ Consigli per la Mindfulness
        </h3>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start space-x-2">
            <span className="text-purple-500">"</span>
            <span>Pratica la mindfulness ogni giorno alla stessa ora per creare una routine</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">"</span>
            <span>Trova un posto tranquillo dove non sarai disturbato</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-500">"</span>
            <span>Non giudicare i tuoi pensieri, osservali semplicemente</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-orange-500">"</span>
            <span>Inizia con sessioni brevi e aumenta gradualmente la durata</span>
          </div>
        </div>
      </Card>

      {/* Modals/Components */}
      <BreathingTimer
        isOpen={showBreathing}
        onClose={() => setShowBreathing(false)}
        onComplete={(duration) => handleSessionComplete('breathing', duration)}
      />

      <RescueBreathing
        isOpen={showRescueBreathing}
        onClose={() => setShowRescueBreathing(false)}
        onComplete={(duration) => handleSessionComplete('breathing', duration, { type: 'emergency' })}
      />

      <MeditationPlayer
        isOpen={showMeditation}
        onClose={() => setShowMeditation(false)}
        onComplete={(duration) => handleSessionComplete('meditation', duration)}
      />
    </div>
  );
};

export default MindfulnessScreen;