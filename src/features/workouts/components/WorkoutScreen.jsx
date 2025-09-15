import React, { useEffect, useRef } from 'react';
import WorkoutTimer from './WorkoutTimer';
import WorkoutDayCard from './WorkoutDayCard';
import { useWorkoutWeek, useWorkoutProgress } from '../hooks/useWorkoutWeek';

// Import dei dati workout (temporaneo - da sostituire con i dati dell'app originale)
const getMasterDayPlanData = (user, date, weekNumber) => {
  const dayNames = ["DOMENICA", "LUNEDÌ", "MARTEDÌ", "MERCOLEDÌ", "GIOVEDÌ", "VENERDÌ", "SABATO"];
  const dayName = dayNames[date.getDay()];

  // Workout plans (semplificati per la demo - nell'app reale verrebbero dai dati utente)
  const workoutPlans = {
    "LUNEDÌ": {
      dayName: "LUNEDÌ",
      workout: {
        focus: "SPINTA - Petto, Spalle, Tricipiti",
        exercises: [
          { name: "CHEST PRESS", sets: "3x10-12", type: 'weights', calories: 60 },
          { name: "PECTORAL MACHINE", sets: "3x12-15", type: 'weights', calories: 50 },
          { name: "ALZATE LATERALI", sets: "3x15", type: 'weights', calories: 40 },
          { name: "PUSH DOWN AI CAVI", sets: "3x12-15", type: 'weights', calories: 45 },
          { name: "PLANK", sets: "4x45 sec", type: 'bodyweight', calories: 70 }
        ]
      }
    },
    "MARTEDÌ": {
      dayName: "MARTEDÌ",
      workout: {
        focus: "CARDIO HIIT & ADDOME",
        exercises: [
          { name: "TAPIS ROULANT", sets: "30 min", type: 'cardio', calories: 350 },
          {
            name: "CIRCUITO ADDOME",
            type: 'circuit',
            calories: 120,
            details: [
              { name: 'Plank', sets: '3x45s' },
              { name: 'Crunch inverso', sets: '3x20' },
              { name: 'Leg raises', sets: '3x15' },
              { name: 'Russian Twist', sets: '3x20' }
            ]
          }
        ]
      }
    },
    "MERCOLEDÌ": {
      dayName: "MERCOLEDÌ",
      workout: {
        focus: "TRAZIONE - Dorso, Bicipiti, Core",
        exercises: [
          { name: "LAT MACHINE", sets: "3x10-12", type: 'weights', calories: 60 },
          { name: "REMATORE (PULLEY)", sets: "3x12-15", type: 'weights', calories: 55 },
          { name: "CURL CON MANUBRI", sets: "3x10-12", type: 'weights', calories: 40 },
          { name: "REVERSE FLY", sets: "3x15", type: 'weights', calories: 35 },
          { name: "CRUNCH INVERSO", sets: "4x20", type: 'bodyweight', calories: 50 }
        ]
      }
    },
    "GIOVEDÌ": {
      dayName: "GIOVEDÌ",
      workout: {
        focus: "CARDIO LISS",
        exercises: [
          { name: "CYCLETTE", sets: "45 min", type: 'cardio', calories: 400 },
          {
            name: "STRETCHING",
            sets: "15 min",
            type: 'bodyweight',
            calories: 50,
            details: [
              { name: 'Stretching quadricipiti', sets: '2x30s' },
              { name: 'Stretching femorali', sets: '2x30s' },
              { name: 'Stretching polpacci', sets: '2x30s' },
              { name: 'Stretching pettorali', sets: '2x30s' },
              { name: 'Stretching schiena (cat-cow)', sets: '1x10' }
            ]
          }
        ]
      }
    },
    "VENERDÌ": {
      dayName: "VENERDÌ",
      workout: {
        focus: "GAMBE - Catena Posteriore",
        exercises: [
          { name: "LEG EXTENSION", sets: "3x15", type: 'weights', calories: 50 },
          { name: "LEG CURL", sets: "3x12-15", type: 'weights', calories: 45 },
          { name: "SQUAT CON MANUBRI", sets: "3x12", type: 'weights', calories: 70 },
          { name: "AFFONDI", sets: "3x10 per gamba", type: 'weights', calories: 60 },
          { name: "CALF RAISE", sets: "4x20", type: 'weights', calories: 30 }
        ]
      }
    },
    "SABATO": {
      dayName: "SABATO",
      workout: {
        focus: "RECUPERO ATTIVO",
        exercises: [
          { name: "CAMMINATA LUNGA", sets: "60 min", type: 'cardio', calories: 300 }
        ]
      }
    },
    "DOMENICA": {
      dayName: "DOMENICA",
      workout: null // Giorno di riposo
    }
  };

  return workoutPlans[dayName] || { dayName, workout: null };
};

const WorkoutScreen = ({
  user,
  progress = {},
  updateProgress,
  isScrolled = false
}) => {
  const todayRef = useRef(null);
  const { weekNumber, weekDays, isToday } = useWorkoutWeek(user.startDate);
  const { progress: workoutProgress, updateProgress: updateWorkoutProgress } = useWorkoutProgress(user.id, progress);

  // Auto-scroll to today's workout
  useEffect(() => {
    if (todayRef.current) {
      const timer = setTimeout(() => {
        todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleProgressUpdate = (key, value) => {
    updateWorkoutProgress(key, value);
    if (updateProgress) {
      updateProgress(key, value);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Allenamenti
        </h1>
        <p className="text-gray-600">
          Settimana {weekNumber} • {user.name}
        </p>
      </div>

      {/* Fixed Timer (visible when not scrolled) */}
      <div className={`transition-opacity duration-300 ${
        isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <WorkoutTimer
          size="lg"
          onTimeChange={(time) => {
            // Optional: Save timer state
            console.log('Timer:', time);
          }}
        />
      </div>

      {/* Mini Timer (visible when scrolled) */}
      <div className={`transition-opacity duration-300 ${
        isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="fixed top-4 right-4 z-10">
          <WorkoutTimer
            size="sm"
            onTimeChange={(time) => {
              console.log('Mini Timer:', time);
            }}
          />
        </div>
      </div>

      {/* Week Overview */}
      <div className="space-y-4">
        {weekDays.map((date, idx) => {
          const dayPlan = getMasterDayPlanData(user, date, weekNumber);
          const isTodayCard = isToday(date);

          return (
            <div
              key={idx}
              ref={isTodayCard ? todayRef : null}
            >
              <WorkoutDayCard
                date={date}
                dayPlan={dayPlan}
                isToday={isTodayCard}
                progress={workoutProgress}
                onProgressUpdate={handleProgressUpdate}
              />
            </div>
          );
        })}
      </div>

      {/* Week Summary */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-gray-800 mb-3">Riepilogo Settimana</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(workoutProgress).filter(key => key.endsWith('_completed') && workoutProgress[key]).length}
            </div>
            <div className="text-xs text-gray-600">Esercizi Completati</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                Object.keys(workoutProgress).filter(key => key.endsWith('_completed') && workoutProgress[key]).length * 50
              )}
            </div>
            <div className="text-xs text-gray-600">Calorie Bruciate</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {new Set(
                Object.keys(workoutProgress)
                  .filter(key => key.endsWith('_completed') && workoutProgress[key])
                  .map(key => {
                    const match = key.match(/workout_([A-Z]+)_/);
                    return match ? match[1] : null;
                  })
                  .filter(Boolean)
              ).size}
            </div>
            <div className="text-xs text-gray-600">Giorni Attivi</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutScreen;