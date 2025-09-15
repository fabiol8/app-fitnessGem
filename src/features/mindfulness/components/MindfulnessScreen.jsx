import React, { useState } from 'react';
import { Card, Button } from '../../../components/ui';
import MeditationPlayer from './MeditationPlayer';
import BreathingTimer from './BreathingTimer';
import RescueBreathing from './RescueBreathing';

const MindfulnessScreen = ({
  user,
  progress = {},
  updateProgress,
  className = ''
}) => {
  const [activeView, setActiveView] = useState('overview'); // overview, meditation, breathing
  const [showRescueBreathing, setShowRescueBreathing] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const getMindfulnessStats = () => {
    const meditationSessions = Object.keys(progress).filter(key =>
      key.startsWith('meditation_') && key.includes(today)
    ).length;

    const breathingSessions = Object.keys(progress).filter(key =>
      key.startsWith('breathing_') && key.includes(today)
    ).length;

    const totalSessionsThisWeek = Object.keys(progress).filter(key => {
      if (!key.startsWith('meditation_') && !key.startsWith('breathing_')) return false;
      const date = key.split('_')[1];
      if (!date) return false;
      const sessionDate = new Date(date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    }).length;

    return {
      meditationToday: meditationSessions,
      breathingToday: breathingSessions,
      totalToday: meditationSessions + breathingSessions,
      weeklyTotal: totalSessionsThisWeek
    };
  };

  const stats = getMindfulnessStats();

  const handleMeditationComplete = (session) => {
    const key = `meditation_${today}_${Date.now()}_${session.technique}`;
    updateProgress(key, {
      type: 'meditation',
      duration: session.duration,
      technique: session.technique,
      completedAt: session.completedAt
    });
    setActiveView('overview');
  };

  const handleBreathingComplete = (session) => {
    const key = `breathing_${today}_${Date.now()}_${session.pattern}`;
    updateProgress(key, {
      type: 'breathing',
      pattern: session.pattern,
      cycles: session.cycles,
      completedAt: session.completedAt
    });
    setActiveView('overview');
  };

  const handleRescueComplete = (session) => {
    const key = `rescue_${today}_${Date.now()}`;
    updateProgress(key, {
      type: 'rescue',
      cycles: session.cycles,
      completedAt: session.completedAt
    });
    setShowRescueBreathing(false);
  };

  if (activeView === 'meditation') {
    return (
      <div className={className}>
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveView('overview')}
          >
            ← Torna alla panoramica
          </Button>
        </div>
        <MeditationPlayer
          isActive={true}
          onComplete={handleMeditationComplete}
        />
      </div>
    );
  }

  if (activeView === 'breathing') {
    return (
      <div className={className}>
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveView('overview')}
          >
            ← Torna alla panoramica
          </Button>
        </div>
        <BreathingTimer
          isActive={true}
          onComplete={handleBreathingComplete}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Emergency Rescue Button */}
      <Card glass padding="md" className="border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🆘</span>
            <div>
              <h3 className="font-semibold text-slate-700">Aiuto Immediato</h3>
              <p className="text-sm text-slate-500">Respirazione di emergenza per ansia acuta</p>
            </div>
          </div>
          <Button
            variant="danger"
            size="lg"
            onClick={() => setShowRescueBreathing(true)}
          >
            SOS
          </Button>
        </div>
      </Card>

      {/* Daily Stats */}
      <Card glass padding="lg">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">
          🧘‍♀️ Mindfulness Oggi
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.meditationToday}
            </div>
            <div className="text-xs text-slate-500">Meditazioni</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.breathingToday}
            </div>
            <div className="text-xs text-slate-500">Respirazioni</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.weeklyTotal}
            </div>
            <div className="text-xs text-slate-500">Questa settimana</div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, (stats.totalToday / 3) * 100)}%`
            }}
          />
        </div>
        <p className="text-xs text-center text-slate-500 mt-2">
          Obiettivo giornaliero: 3 sessioni
        </p>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card
          glass
          padding="lg"
          className="cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => setActiveView('meditation')}
        >
          <div className="text-center">
            <div className="text-3xl mb-3">🧘‍♀️</div>
            <h3 className="font-semibold text-slate-700 mb-2">
              Meditazione Guidata
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Sessioni da 3 a 20 minuti con diverse tecniche
            </p>
            <Button variant="primary" size="sm" className="w-full">
              Inizia
            </Button>
          </div>
        </Card>

        <Card
          glass
          padding="lg"
          className="cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => setActiveView('breathing')}
        >
          <div className="text-center">
            <div className="text-3xl mb-3">🌬️</div>
            <h3 className="font-semibold text-slate-700 mb-2">
              Respirazione Guidata
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Tecniche di respirazione per rilassamento ed energia
            </p>
            <Button variant="primary" size="sm" className="w-full">
              Inizia
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Sessions */}
      {stats.totalToday > 0 && (
        <Card glass padding="lg">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            Sessioni di Oggi
          </h3>
          <div className="space-y-3">
            {Object.entries(progress)
              .filter(([key]) =>
                (key.startsWith('meditation_') || key.startsWith('breathing_') || key.startsWith('rescue_')) &&
                key.includes(today)
              )
              .map(([key, session], index) => (
                <div key={key} className="flex items-center justify-between p-3 bg-white/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {session.type === 'meditation' ? '🧘‍♀️' :
                       session.type === 'breathing' ? '🌬️' : '🆘'}
                    </span>
                    <div>
                      <div className="font-medium text-slate-700">
                        {session.type === 'meditation' ? 'Meditazione' :
                         session.type === 'breathing' ? 'Respirazione' : 'Emergenza'}
                      </div>
                      <div className="text-sm text-slate-500">
                        {session.duration ? `${Math.round(session.duration / 60)} min` :
                         session.cycles ? `${session.cycles} cicli` : 'Completata'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {new Date(session.completedAt).toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Tips & Benefits */}
      <Card glass padding="lg">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          💡 Benefici della Mindfulness
        </h3>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">•</span>
            <span>Riduce stress e ansia in modo naturale</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-500">•</span>
            <span>Migliora la concentrazione e la produttività</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-purple-500">•</span>
            <span>Favorisce un sonno più riposante</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-orange-500">•</span>
            <span>Aumenta la consapevolezza emotiva</span>
          </div>
        </div>
      </Card>

      {/* Rescue Breathing Modal */}
      <RescueBreathing
        isOpen={showRescueBreathing}
        onClose={() => setShowRescueBreathing(false)}
        onComplete={handleRescueComplete}
      />
    </div>
  );
};

export default MindfulnessScreen;