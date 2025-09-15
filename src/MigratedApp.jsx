import React, { useState, useEffect, useRef, forwardRef, useMemo } from 'react';
import { db, isFirebaseConfigured } from './firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

// NUOVO: Import dei componenti modulari
import { UserSelector } from './features/users';
import { useUserManagement } from './features/users/hooks/useUserManagement';

// --- MULTI-USER DATA & CONFIGURATION (da migrare gradualmente) ---

const USERS = {
    Fabio: {
        name: "Fabio",
        startDate: "2025-09-08",
        endDate: "2027-03-08",
        startWeight: 127,
        goalWeight: 80,
        intermediateGoalWeight: 100,
        durationWeeks: 78,
        height: 180,
        startMeasurements: { weight: 127, bodyFat: 40, chest: 130, waist: 140, hips: 135, arms: 45, neck: 48 },
        goalMeasurements: { weight: 80, bodyFat: 18, chest: 105, waist: 95, hips: 100, arms: 38, neck: 40 }
    },
    Iarno: {
        name: "Iarno",
        startDate: "2025-09-01",
        endDate: "2026-06-01",
        startWeight: 95,
        goalWeight: 85,
        intermediateGoalWeight: 90,
        durationWeeks: 40,
        height: 185,
        startMeasurements: { weight: 95, bodyFat: 22, chest: 110, waist: 100, hips: 105, arms: 40, neck: 42 },
        goalMeasurements: { weight: 85, bodyFat: 15, chest: 115, waist: 88, hips: 100, arms: 42, neck: 41 }
    }
};

// Resto del codice App.jsx originale...
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

const meditations = [
    { id: 1, title: "Meditazione del Risveglio", duration: 5, category: "Mattina" },
    { id: 2, title: "Scansione Corporea", duration: 10, category: "Rilassamento" },
    { id: 3, title: "Respiro Consapevole", duration: 7, category: "SOS Stress" },
    { id: 4, title: "Meditazione della Gratitudine", duration: 8, category: "Sera" },
    { id: 5, title: "Visualizzazione Guidata", duration: 15, category: "Rilassamento" }
];

const motivationalQuotes = [
    "La disciplina è il ponte tra gli obiettivi e la realizzazione.",
    "Non devi essere grande per iniziare, ma devi iniziare per essere grande.",
    "Il corpo ottiene ciò in cui la mente crede.",
    "La goccia scava la roccia, non per la sua forza, ma per la sua costanza.",
    "Il successo è la somma di piccoli sforzi ripetuti giorno dopo giorno."
];

// Per ora uso una versione semplificata degli hooks esistenti nel App.jsx originale
const usePersistentState = (key, defaultValue) => {
    const [state, setState] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    const setValue = (value) => {
        setState(value);
        localStorage.setItem(key, JSON.stringify(value));
    };

    return [state, setValue];
};

/**
 * MIGRATED APP - Esempio di integrazione graduale
 * Questo dimostra come sostituire step-by-step i componenti del monolite
 */
const MigratedApp = () => {
    // NUOVO: Hook per gestione utenti modulare
    const { currentUser, availableUsers, selectUser, isLoggedIn } = useUserManagement();

    // Stato esistente (da migrare gradualmente)
    const [activeTab, setActiveTab] = useState('oggi');

    // Migrazione in corso: Se non c'è utente selezionato, mostra il nuovo UserSelector
    if (!isLoggedIn || !currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="absolute top-4 right-4">
                    <div className="bg-white rounded-lg shadow-md p-3 text-sm">
                        <p className="font-semibold text-green-600">✅ Migrazione Attiva</p>
                        <p className="text-gray-600">UserSelector modulare</p>
                    </div>
                </div>

                <UserSelector
                    onUserSelected={(user) => {
                        console.log('User selected:', user);
                        // Il hook gestisce automaticamente la selezione
                    }}
                />
            </div>
        );
    }

    // Una volta selezionato l'utente, mostra l'app con l'utente corrente
    // Per ora uso una versione semplificata dell'app originale
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header con info migrazione */}
            <div className="bg-white shadow-sm border-b border-gray-200 p-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">App Fitness</h1>
                        <p className="text-sm text-gray-600">
                            Utente: <span className="font-medium">{currentUser.name}</span>
                        </p>
                    </div>

                    <div className="text-right">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs">
                            <p className="font-semibold text-green-800">🚀 Architettura Modulare</p>
                            <p className="text-green-600">UserSelector: ✅ Migrato</p>
                        </div>
                        <button
                            onClick={() => selectUser(null)}
                            className="mt-2 text-xs text-blue-600 hover:underline"
                        >
                            Cambia Utente
                        </button>
                    </div>
                </div>
            </div>

            {/* Main App Content */}
            <div className="max-w-4xl mx-auto p-4">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Benvenuto, {currentUser.name}! 👋
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-800 mb-2">Profilo Utente</h3>
                            <div className="text-sm text-blue-700 space-y-1">
                                <p>Peso iniziale: {currentUser.startWeight}kg</p>
                                <p>Obiettivo: {currentUser.goalWeight}kg</p>
                                <p>Altezza: {currentUser.height}cm</p>
                                <p>Durata: {currentUser.durationWeeks} settimane</p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="font-semibold text-yellow-800 mb-2">Stato Migrazione</h3>
                            <div className="text-sm text-yellow-700 space-y-1">
                                <p>✅ UserSelector → Modulare</p>
                                <p>🔄 ProgressScreen → In corso</p>
                                <p>⏳ WorkoutScreen → Pianificato</p>
                                <p>⏳ NutritionScreen → Pianificato</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Demo Migrazione:</strong> Questo mostra come integrare gradualmente i nuovi componenti modulari nell'app esistente.
                        </p>
                        <p className="text-xs text-gray-500">
                            Il UserSelector è già stato migrato con successo. I prossimi step includeranno la migrazione dei screen principali usando i nuovi hook e componenti UI.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MigratedApp;