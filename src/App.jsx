import React, { useState, useEffect, useRef, forwardRef, useMemo } from 'react';
import { db, isFirebaseConfigured } from './firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

// --- MULTI-USER DATA & CONFIGURATION ---

const USERS = {
    Fabio: {
        name: "Fabio",
        startDate: "2025-09-08",
        endDate: "2027-03-08",
        startWeight: 127,
        goalWeight: 80,
        intermediateGoalWeight: 100, // Added intermediate goal
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
        intermediateGoalWeight: 90, // Added intermediate goal
        durationWeeks: 40,
        height: 185,
        startMeasurements: { weight: 95, bodyFat: 22, chest: 110, waist: 100, hips: 105, arms: 40, neck: 42 },
        goalMeasurements: { weight: 85, bodyFat: 15, chest: 115, waist: 88, hips: 100, arms: 42, neck: 41 }
    }
};

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

// --- DIET PLANS ---

const getFabioDayPlanData = (date, weekNumber) => {
    const dayNames = ["DOMENICA", "LUNEDÌ", "MARTEDÌ", "MERCOLEDÌ", "GIOVEDÌ", "VENERDÌ", "SABATO"];
    const dayName = dayNames[date.getDay()];

    const supplements = {
        energeticDrink: { time: "08:00", items: [{ name: "Real Ketones", dose: "1 bustina" }, { name: "Olio MCT", dose: "5ml" }] },
        morning: { time: "08:15", items: [{ name: "Lion’s Mane", dose: "1 capsula" }, { name: "Diosmina Esperidina", dose: "1 compressa" }] },
        lunch: { time: "13:30", items: [{ name: "Omega-3 Vegano", dose: "1 capsula" }, { name: "Integratore Articolazioni", dose: "da etichetta" }] },
        preWorkout: { time: "19:15", items: [{ name: "Cordyceps", dose: "1 capsula" }] },
        preDinner: { time: "21:00", items: [{ name: "Psyllium", dose: "5g in acqua" }] },
        dinner: { time: "21:15", items: [{ name: "Creatina Monoidrato", dose: "5 compresse" }, { name: "Omega-3 Vegano", dose: "1 capsula" }] },
        night: { time: "23:00", items: [{ name: "ZMA", dose: "1 dose" }] }
    };
    
    const basePlans = {
        "LUNEDÌ": { dayName: "LUNEDÌ", meals: [{ time: "13:30", name: "Insalatona Proteica di Quinoa", calories: 750, protein: 25, carbs: 80, fats: 35, ingredients: ["80g Quinoa (cruda)", "150g fagioli neri cotti", "50g mais", "1/2 peperone", "50g spinaci freschi", "30g anacardi", "1 cucchiaio Olio EVO"], prep: "Cuoci la quinoa e lasciala raffreddare. Uniscila in una ciotola con fagioli, mais, peperone a cubetti e spinaci. Tosta gli anacardi e aggiungili. Condisci con olio, sale e succo di lime." }, { time: "16:00", name: "Spuntino", calories: 220, protein: 7, carbs: 25, fats: 11, ingredients: ["1 Mela media", "15 Mandorle"], prep: "Consumare insieme." }, { time: "21:15", name: "Vellutata di Lenticchie Rosse", calories: 650, protein: 38, carbs: 90, fats: 15, ingredients: ["150g Lenticchie rosse secche", "2 carote", "1 gambo di sedano", "1/2 cipolla", "1 cucchiaio Olio EVO"], prep: "Soffriggi le verdure tritate. Aggiungi le lenticchie sciacquate e tosta per un minuto. Copri con brodo e cuoci per 20 minuti. Frulla fino a ottenere una crema." }], supplements: [supplements.energeticDrink, supplements.morning, supplements.lunch, supplements.preWorkout, supplements.preDinner, supplements.dinner, supplements.night], workout: { focus: "SPINTA - Petto, Spalle, Tricipiti", exercises: [{ name: "CHEST PRESS", sets: "3x10-12", type: 'weights', calories: 60 }, { name: "PECTORAL MACHINE", sets: "3x12-15", type: 'weights', calories: 50 }, { name: "ALZATE LATERALI", sets: "3x15", type: 'weights', calories: 40 }, { name: "PUSH DOWN AI CAVI", sets: "3x12-15", type: 'weights', calories: 45 }, { name: "PLANK", sets: "4x45 sec", type: 'bodyweight', calories: 70 }] }},
        "MARTEDÌ": { dayName: "MARTEDÌ", meals: [{ time: "13:30", name: "Riso di Cavolfiore con Ceci e Verdure Miste", calories: 450, protein: 15, carbs: 55, fats: 18, ingredients: ["300g Cavolfiore", "150g ceci cotti", "1 zucchina", "10 pomodorini", "1 cucchiaio Olio EVO"], prep: "Grattugia il cavolfiore per ottenere una consistenza simile al riso. Salta in padella le verdure a cubetti per 5 minuti. Aggiungi il cavolfiore e i ceci e cuoci per altri 5-7 minuti." }, { time: "16:00", name: "Spuntino", calories: 200, protein: 5, carbs: 20, fats: 12, ingredients: ["1 Pera", "10 Noci"], prep: "Consumare insieme." }, { time: "21:15", name: "Burger di Fagioli Cannellini", calories: 420, protein: 22, carbs: 60, fats: 10, ingredients: ["200g Fagioli cannellini cotti", "30g fiocchi d'avena senza glutine", "1/4 di cipolla", "1 cucchiaino Olio EVO"], prep: "Schiaccia i fagioli con una forchetta, uniscili agli altri ingredienti e impasta. Forma due burger e cuocili in padella per 4-5 minuti per lato." }], supplements: [supplements.energeticDrink, supplements.morning, supplements.lunch, supplements.preDinner, supplements.dinner, supplements.night], workout: { focus: "CARDIO HIIT & ADDOME", exercises: [{ name: "TAPIS ROULANT", sets: "30 min", type: 'cardio', calories: 350 }, { name: "CIRCUITO ADDOME", type: 'bodyweight', calories: 120, details: [{ name: 'Plank', sets: '3x45s' }, { name: 'Crunch inverso', sets: '3x20' }, { name: 'Leg raises', sets: '3x15' }, { name: 'Russian Twist', sets: '3x20' }] }] }},
        "MERCOLEDÌ": { dayName: "MERCOLEDÌ", meals: [{ time: "13:30", name: "Buddha Bowl", calories: 710, protein: 28, carbs: 85, fats: 28, ingredients: ["80g Quinoa", "150g ceci", "200g zucca", "50g spinacini", "1/4 avocado", "1 cucchiaio Tahini"], prep: "Cuoci la quinoa. Cuoci la zucca al forno. Componi la ciotola con tutti gli ingredienti e condisci con una salsa preparata con tahini e succo di limone." }, { time: "16:00", name: "Spuntino", calories: 250, protein: 10, carbs: 30, fats: 10, ingredients: ["1 vasetto Yogurt Greco 0%", "10g semi di Chia"], prep: "Mescolare e lasciare riposare 5 min." }, { time: "21:15", name: "Zuppa di Fave e Piselli con Menta", calories: 380, protein: 24, carbs: 55, fats: 7, ingredients: ["200g Fave", "150g piselli", "1/2 cipolla", "Menta fresca", "Olio EVO"], prep: "Soffriggi la cipolla, aggiungi fave e piselli. Copri con brodo vegetale e cuoci per 15 minuti. Aggiungi la menta fresca e frulla parzialmente per ottenere una consistenza cremosa ma con pezzi interi." }], supplements: [supplements.energeticDrink, supplements.morning, supplements.lunch, supplements.preWorkout, supplements.preDinner, supplements.dinner, supplements.night], workout: { focus: "TRAZIONE - Dorso, Bicipiti, Core", exercises: [{ name: "LAT MACHINE", sets: "3x10-12", type: 'weights', calories: 60 }, { name: "REMATORE (PULLEY)", sets: "3x12-15", type: 'weights', calories: 55 }, { name: "CURL CON MANUBRI", sets: "3x10-12", type: 'weights', calories: 40 }, { name: "REVERSE FLY", sets: "3x15", type: 'weights', calories: 35 }, { name: "CRUNCH INVERSO", sets: "4x20", type: 'bodyweight', calories: 50 }] }},
        "GIOVEDÌ": { dayName: "GIOVEDÌ", meals: [{ time: "13:30", name: "Curry Leggero di Lenticchie Verdi e Spinaci", calories: 380, protein: 15, carbs: 45, fats: 15, ingredients: ["150g Lenticchie verdi cotte", "100ml latte di cocco light", "80g spinaci freschi", "1/4 di cipolla", "zenzero", "curcuma", "Olio EVO"], prep: "Soffriggi la cipolla e lo zenzero. Aggiungi la curcuma e le lenticchie. Versa il latte di cocco e cuoci per 5 minuti. Aggiungi gli spinaci alla fine e cuoci finché non appassiscono." }, { time: "16:00", name: "Spuntino", calories: 180, protein: 6, carbs: 40, fats: 1, ingredients: ["1 Banana", "Pugno di mirtilli"] }, { time: "21:15", name: "\"Hummus Bowl\" Decostruita", calories: 420, protein: 15, carbs: 40, fats: 20, ingredients: ["150g Ceci cotti", "2 carote", "1/2 finocchio", "10 olive taggiasche", "1 cucchiaio Tahini"], prep: "Taglia le verdure a bastoncini. Metti i ceci in una ciotola, aggiungi le verdure e le olive. Condisci con una salsa di tahini, limone e acqua." }], supplements: [supplements.energeticDrink, supplements.morning, supplements.lunch, supplements.preDinner, supplements.dinner, supplements.night], workout: { focus: "CARDIO LISS", exercises: [{ name: "CYCLETTE", sets: "45 min", type: 'cardio', calories: 400 }, { name: "STRETCHING", sets: "15 min", type: 'bodyweight', calories: 50, details: [{ name: 'Stretching quadricipiti', sets: '2x30s' }, { name: 'Stretching femorali', sets: '2x30s' }, { name: 'Stretching polpacci', sets: '2x30s' }, { name: 'Stretching pettorali', sets: '2x30s' }, { name: 'Stretching schiena (cat-cow)', sets: '1x10' }] }] }},
        "VENERDÌ": { dayName: "VENERDÌ", meals: [{ time: "13:30", name: "Spezzatino di Lenticchie e Funghi", calories: 670, protein: 40, carbs: 95, fats: 12, ingredients: ["150g Lenticchie", "150g funghi", "soffritto di carota, sedano e cipolla", "100g passata di pomodoro", "rosmarino", "Olio EVO"], prep: "Soffriggi le verdure. Aggiungi i funghi a pezzi. Unisci le lenticchie, la passata di pomodoro e il rosmarino. Cuoci per circa 15 minuti." }, { time: "16:00", name: "Spuntino", calories: 250, protein: 20, carbs: 30, fats: 5, ingredients: ["1 shake Proteine Vegane", "Acqua"] }, { time: "21:15", name: "Polpette di Melanzane e Fagioli al forno", calories: 260, protein: 10, carbs: 35, fats: 8, ingredients: ["1 melanzana", "100g fagioli borlotti cotti", "basilico", "aglio", "Olio EVO"], prep: "Cuoci la melanzana in forno. Preleva la polpa e frullala con i fagioli, il basilico e l'aglio. Forma delle polpette e cuocile in forno a 180°C per 20 minuti." }], supplements: [supplements.energeticDrink, supplements.morning, supplements.lunch, supplements.preWorkout, supplements.preDinner, supplements.dinner, supplements.night], workout: { focus: "GAMBE - Catena Posteriore", exercises: [{ name: "LEG EXTENSION", sets: "3x15", type: 'weights', calories: 50 }, { name: "LEG CURL", sets: "3x12-15", type: 'weights', calories: 45 }, { name: "SQUAT CON MANUBRI", sets: "3x12", type: 'weights', calories: 70 }, { name: "AFFONDI", sets: "3x10 per gamba", type: 'weights', calories: 60 }, { name: "CALF RAISE", sets: "4x20", type: 'weights', calories: 30 }] }},
        "SABATO": { dayName: "SABATO", meals: [{ time: "13:30", name: "Insalata di Finocchi e Arance", calories: 300, protein: 3, carbs: 20, fats: 23, ingredients: ["1 finocchio grande", "1 arancia", "15 olive taggiasche", "Olio EVO"], prep: "Affetta finemente il finocchio. Pela l'arancia \"a vivo\" e tagliala a spicchi. Unisci tutto in una ciotola con le olive e condisci." }, { time: "16:00", name: "Spuntino", calories: 200, protein: 5, carbs: 10, fats: 15, ingredients: ["30g Frutta secca mista"] }, { time: "21:15", name: "Pasto Libero (Pizza)", calories: 1200, protein: 40, carbs: 150, fats: 45, ingredients: ["Pizza Margherita o Vegetariana"] }], supplements: [supplements.energeticDrink, supplements.morning, supplements.lunch, supplements.night], workout: { focus: "RECUPERO ATTIVO", exercises: [{ name: "CAMMINATA LUNGA", sets: "60 min", type: 'cardio', calories: 300 }] }},
        "DOMENICA": { dayName: "DOMENICA", meals: [{ time: "11:00", name: "Pasto Libero (Brunch)", calories: 800, protein: 30, carbs: 90, fats: 35, ingredients: ["Pasto Libero con consapevolezza"] }, { time: "17:00", name: "Spuntino Leggero", calories: 200, protein: 10, carbs: 25, fats: 5, ingredients: ["Yogurt e frutta"] }, { time: "21:00", name: "Minestrone Leggero", calories: 200, protein: 8, carbs: 30, fats: 5, ingredients: ["1 porzione Minestrone surgelato tipo \"leggerezza\"", "1 cucchiaino Olio EVO a crudo"], prep: "Segui le istruzioni sulla confezione. Aggiungi l'olio a crudo prima di servire." }], supplements: [supplements.morning, supplements.night], workout: null },
    };

    return basePlans[dayName] || basePlans["LUNEDÌ"];
};

const getIarnoDayPlanData = (date, weekNumber) => {
    // Start with a deep copy of Fabio's plan for the given day
    const iarnoPlan = JSON.parse(JSON.stringify(getFabioDayPlanData(date, weekNumber)));

    // Define Iarno's specific supplements
    const iarnoSupplements = {
        morning: {
            time: "08:15", items: [
                { name: "Psyllium", dose: "2 capsule" },
                { name: "Riso Rosso Fermentato", dose: "1 compressa" },
                { name: "Curcuma", dose: "1 capsula" }
            ]
        },
        lunch: { time: "13:30", items: [{ name: "Omega-3 Vegano", dose: "1 capsula" }] },
        dinner: {
            time: "21:15", items: [
                { name: "Creatina Monoidrato", dose: "3 compresse" },
                { name: "Omega-3 Vegano", dose: "1 capsula" }
            ]
        },
        night: { time: "23:00", items: [{ name: "ZMA", dose: "1 compressa" }] }
    };

    // Define Iarno's specific breakfast options
    const iarnoBreakfast = {
        time: "08:00",
        name: "Colazione a Scelta",
        type: 'choice',
        options: [
            { name: "Chia Pudding", calories: 570, protein: 21, carbs: 45, fats: 35, prep: "Da preparare la sera prima.", ingredients: ["40g Semi di Chia", "250ml Latte di Mandorla (non zuccherato)", "100g Frutti di Bosco", "30g Mandorle a lamelle", "15g Semi di Canapa"] },
            { name: "No-Porridge Cremoso", calories: 720, protein: 17, carbs: 25, fats: 60, prep: "Pronto in 5 min.", ingredients: ["30g Semi di Lino macinati", "20g Farina di Mandorle", "100ml Latte di Cocco (in lattina)", "100-150ml Acqua calda", "80g Frutti di Bosco", "30g Noci tritate"] },
            { name: "Ciotola di Cocco", calories: 490, protein: 11, carbs: 20, fats: 40, prep: "Pronta in 2 min.", ingredients: ["200g Yogurt di Cocco (non zuccherato)", "100g Frutti di Bosco", "40g Mix Frutta Secca/Semi", "1 cucchiaio Cocco rapè"] }
        ]
    };

    // Replace breakfast if it's a standard day
    if (iarnoPlan && iarnoPlan.meals) {
        const breakfastIndex = iarnoPlan.meals.findIndex(meal => meal.time === "08:00");
        const dayName = iarnoPlan.dayName || "";

        if (!dayName.includes("Digiuno")) {
            if (breakfastIndex !== -1) {
                // This case should not happen anymore for Mon-Sat, but we keep it for safety
                iarnoPlan.meals[breakfastIndex] = iarnoBreakfast;
            } else {
                // Since Fabio's 08:00 drink is now a supplement, we add Iarno's breakfast.
                iarnoPlan.meals.unshift(iarnoBreakfast);
                iarnoPlan.meals.sort((a, b) => a.time.localeCompare(b.time));
            }
        }
    }

    // Replace supplements based on the day's schedule from Fabio's plan
    if (iarnoPlan.supplements) {
        const newSupplements = [];
        const hasMorning = iarnoPlan.supplements.some(s => s.time === "08:15");
        const hasLunch = iarnoPlan.supplements.some(s => s.time === "13:30");
        const hasDinner = iarnoPlan.supplements.some(s => s.time === "21:15");
        const hasNight = iarnoPlan.supplements.some(s => s.time === "23:00");

        if (hasMorning) newSupplements.push(iarnoSupplements.morning);
        if (hasLunch) newSupplements.push(iarnoSupplements.lunch);
        if (hasDinner) newSupplements.push(iarnoSupplements.dinner);
        if (hasNight) newSupplements.push(iarnoSupplements.night);

        iarnoPlan.supplements = newSupplements;
    }

    return iarnoPlan;
};

// Master function to get data based on user
const getMasterDayPlanData = (user, date, weekNumber, isFastingDay = false) => {
    if (isFastingDay) {
        return {
            dayName: "GIORNO DI DIGIUNO",
            meals: [],
            supplements: [],
            workout: { focus: "RECUPERO ATTIVO O LEGGERO", exercises: [{ name: "CAMMINATA LUNGA", sets: "60 min", type: 'cardio', calories: 300 }] }
        };
    }
    if (user.name === "Iarno") {
        return getIarnoDayPlanData(date, weekNumber);
    }
    // Default to Fabio
    return getFabioDayPlanData(date, weekNumber);
};

// --- CUSTOM HOOKS ---
const useDailyProgress = (keyPrefix, user) => {
    const [progress, setProgress] = useState({});
    const todayString = new Date().toISOString().slice(0, 10);
    const storageKey = user ? `${keyPrefix}_${user.name}_${todayString}` : null;
    const useCloud = isFirebaseConfigured && !!db && !!user;
    const fromRemoteRef = useRef(false);

    useEffect(() => {
        if (!storageKey) return;
        if (!useCloud) {
            try {
                const storedProgress = localStorage.getItem(storageKey);
                setProgress(storedProgress ? JSON.parse(storedProgress) : {});
            } catch (e) { console.error('Failed to load progress', e); setProgress({}); }
            return;
        }
        const ref = doc(db, 'users', user.name, 'progress', todayString);
        const unsub = onSnapshot(ref, (snap) => {
            const data = snap.exists() ? snap.data() : {};
            fromRemoteRef.current = true;
            setProgress(data);
        }, (err) => console.error('Firestore progress subscribe error:', err));
        return () => unsub();
    }, [storageKey, useCloud, user?.name, todayString]);

    const updateProgress = async (key, value) => {
        if (!storageKey) return;
        const newProgress = { ...progress, [key]: value };
        setProgress(newProgress);

        if (!useCloud) {
            try { localStorage.setItem(storageKey, JSON.stringify(newProgress)); } catch (e) { console.error('Failed to save progress', e); }
            return;
        }
        try {
            if (fromRemoteRef.current) { fromRemoteRef.current = false; return; }
            const ref = doc(db, 'users', user.name, 'progress', todayString);
            await setDoc(ref, { [key]: value, updatedAt: serverTimestamp() }, { merge: true });
        } catch (e) {
            console.error('Failed to write progress to Firestore', e);
        }
    };

    return [progress, updateProgress];
};

const usePersistentState = (key, defaultValue, user) => {
    const storageKey = user ? `${key}_${user.name}` : key;
    const useCloud = isFirebaseConfigured && !!db && !!user;
    const [state, setState] = useState(defaultValue);
    const fromRemoteRef = useRef(false);

    useEffect(() => {
        if (!storageKey) return;
        if (!useCloud) {
            try {
                const storedValue = localStorage.getItem(storageKey);
                setState(storedValue ? JSON.parse(storedValue) : defaultValue);
            } catch (error) {
                console.error(`Error reading localStorage key “${storageKey}”:`, error);
                setState(defaultValue);
            }
            return;
        }
        const ref = doc(db, 'users', user.name, 'state', key);
        const unsub = onSnapshot(ref, (snap) => {
            const data = snap.exists() ? snap.data()?.value : undefined;
            fromRemoteRef.current = true;
            setState(data !== undefined ? data : defaultValue);
        }, (err) => console.error('Firestore state subscribe error:', err));
        return () => unsub();
    }, [storageKey, useCloud, user?.name, key]);

    useEffect(() => {
        if (!storageKey) return;
        if (!useCloud) {
            try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
            return;
        }
        const write = async () => {
            try {
                if (fromRemoteRef.current) { fromRemoteRef.current = false; return; }
                const ref = doc(db, 'users', user.name, 'state', key);
                await setDoc(ref, { value: state, updatedAt: serverTimestamp() }, { merge: true });
            } catch (e) {
                console.error('Failed to write state to Firestore', e);
            }
        };
        write();
    }, [state, storageKey, useCloud, user?.name, key]);

    return [state, setState];
};

const useCountdown = (targetDate) => {
    const [daysLeft, setDaysLeft] = useState('');
    useEffect(() => {
        if (!targetDate) return;
        const end = new Date(targetDate);
        const calculate = () => {
            const now = new Date();
            const diff = end.getTime() - now.getTime();
            setDaysLeft(diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 'Raggiunto!');
        };
        calculate();
        const interval = setInterval(calculate, 60000);
        return () => clearInterval(interval);
    }, [targetDate]);
    return daysLeft;
};

const useWeeklyProgress = (key, user) => {
    const [weeklyData, setWeeklyData] = usePersistentState(key, [], user);

    const addWeeklyEntry = (newEntry) => {
        const updatedData = [...weeklyData, { ...newEntry, date: new Date().toISOString() }];
        setWeeklyData(updatedData);
    };

    return [weeklyData, addWeeklyEntry];
};

const useDailyMacros = (user, progress, fastingDays) => {
    const today = new Date();
    const dateString = today.toISOString().slice(0, 10);
    const isFastingDay = !!fastingDays[dateString];

    const dayPlan = useMemo(() => {
        if (isFastingDay) return { meals: [], workout: null, supplements: [] };
        const start = new Date(user.startDate);
        const diffTime = Math.abs(today - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weekNumber = Math.ceil(diffDays / 7);
        return getMasterDayPlanData(user, today, weekNumber, false);
    }, [user, dateString, isFastingDay]);

    const totals = useMemo(() => {
        const result = { calories: 0, protein: 0, carbs: 0, fats: 0 };
        if (!dayPlan.meals) return result;
        dayPlan.meals.forEach(meal => {
            if (meal.type === 'choice') {
                const numOptions = meal.options.length;
                if(numOptions > 0) {
                    result.calories += meal.options.reduce((sum, opt) => sum + (opt.calories || 0), 0) / numOptions;
                    result.protein += meal.options.reduce((sum, opt) => sum + (opt.protein || 0), 0) / numOptions;
                    result.carbs += meal.options.reduce((sum, opt) => sum + (opt.carbs || 0), 0) / numOptions;
                    result.fats += meal.options.reduce((sum, opt) => sum + (opt.fats || 0), 0) / numOptions;
                }
            } else {
                result.calories += meal.calories || 0;
                result.protein += meal.protein || 0;
                result.carbs += meal.carbs || 0;
                result.fats += meal.fats || 0;
            }
        });
        Object.keys(result).forEach(key => result[key] = Math.round(result[key]));
        return result;
    }, [dayPlan]);

    const consumed = useMemo(() => {
        const result = { calories: 0, protein: 0, carbs: 0, fats: 0 };
        if (!dayPlan.meals) return result;

        dayPlan.meals.forEach(meal => {
            const mealId = `meal_${dayPlan.dayName}_${meal.time.replace(':', '')}`;
            if (progress[mealId]) {
                 if (meal.type === 'choice') {
                    // This is a limitation: we can't know which option was selected.
                    // We'll assume the first option for calculation purposes.
                    const chosenOption = meal.options[0];
                    if (chosenOption) {
                        result.calories += chosenOption.calories || 0;
                        result.protein += chosenOption.protein || 0;
                        result.carbs += chosenOption.carbs || 0;
                        result.fats += chosenOption.fats || 0;
                    }
                 } else {
                    result.calories += meal.calories || 0;
                    result.protein += meal.protein || 0;
                    result.carbs += meal.carbs || 0;
                    result.fats += meal.fats || 0;
                 }
            }
        });
        return result;
    }, [progress, dayPlan]);
    
    const burnedCalories = useMemo(() => {
        let total = 0;
        if (dayPlan.workout && dayPlan.workout.exercises) {
            dayPlan.workout.exercises.forEach(exercise => {
                const completedId = `workout_${dayPlan.dayName}_${exercise.name.replace(/\s+/g, '_')}_completed`;
                if (progress[completedId]) {
                    total += exercise.calories || 0;
                }
            });
        }
        return total;
    }, [progress, dayPlan]);

    return { totals, consumed, burnedCalories };
};

// --- HELPER FUNCTIONS ---
const getExerciseImageUrl = (exerciseName) => {
    const formattedName = exerciseName.replace(/\s+/g, '+');
    return `https://placehold.co/100x80/EBF4FF/1E40AF?text=${formattedName}&font=inter`;
};

const getCategoryForIngredient = (name) => {
    const categories = {
        'Verdura': ['peperone', 'spinaci', 'carote', 'sedano', 'cipolla', 'cavolfiore', 'zucchina', 'pomodorini', 'rucola', 'aglio', 'funghi', 'melanzana', 'patate dolci', 'verdure miste', 'broccoli', 'fagiolini', 'asparagi', 'insalata mista', 'zucca', 'spinacini', 'zenzero', 'finocchio', 'fave', 'piselli', 'menta fresca', 'basilico'],
        'Frutta & Frutta Secca': ['mela', 'mandorle', 'anacardi', 'pera', 'noci', 'semi di chia', 'banana', 'mirtilli', 'frutta secca mista', 'frutti di bosco', 'noci tritate', 'mandorle a lamelle', 'mix frutta secca/semi', 'avocado', 'semi di girasole', 'semi di zucca', 'pinoli', 'olive taggiasche', 'arancia'],
        'Dispensa': ['quinoa', 'fagioli', 'mais', 'lenticchie', 'ceci', 'fiocchi d\'avena', 'pasta grano saraceno', 'farro', 'riso basmati', 'pangrattato', 'olio mct', 'avena', 'semi di canapa', 'semi di lino', 'farina di mandorle', 'cocco rapè', 'tahini', 'passata di pomodoro', 'crostini di pane integrale', 'minestrone surgelato'],
        'Proteine': ['tofu', 'uova', 'salmone', 'petto di pollo', 'albumi', 'bistecca di manzo', 'fesa di tacchino', 'burger vegetariano', 'tempeh'],
        'Latticini & Alternative': ['yogurt greco', 'parmigiano', 'yogurt', 'latte di mandorla', 'latte di cocco', 'yogurt di cocco', 'salsa yogurt'],
        'Condimenti': ['olio evo', 'curcuma', 'limone', 'rosmarino'],
        'Bevande & Integratori': ['real ketones', 'proteine vegane', 'caffè', 'tisane', 'proteine whey', 'acqua calda'],
        'Altro': ['pizza a scelta', 'pasto a scelta', 'brunch a scelta']
    };
    const lowerCaseName = name.toLowerCase();
    for (const category in categories) {
        if (categories[category].some(keyword => lowerCaseName.includes(keyword))) {
            return category;
        }
    }
    return 'Altro';
};

// Parse and aggregate ingredient entries like "80g Quinoa" or "1/2 cipolla"
const processIngredient = (ingredientStr, aggregated) => {
    const knownUnits = ['g', 'kg', 'ml', 'l', 'bustina', 'spicchio', 'vasetto', 'compressa', 'capsula', 'cucchiaio', 'cucchiaino'];
    const unitRegex = new RegExp(`^(\\d+(?:[\\.,]\\d+)?|\\d+\\/\\d+)?\\s*(${knownUnits.join('|')})?\\s*(.*)$`, 'i');

    const input = String(ingredientStr || '').trim();
    const match = input.match(unitRegex);

    let qtyStr = '1';
    let unit = '';
    let name = input;

    if (match) {
        if (match[1]) qtyStr = match[1];
        if (match[2]) unit = match[2];
        if (match[3]) name = match[3].trim();
    }

    const parseQty = (s) => {
        const str = String(s).replace(',', '.');
        if (str.includes('/')) {
            const [a, b] = str.split('/').map(Number);
            if (!isNaN(a) && !isNaN(b) && b !== 0) return a / b;
        }
        const n = parseFloat(str);
        return isNaN(n) ? 1 : n;
    };

    const quantity = parseQty(qtyStr);
    const key = `${name.toLowerCase()}|${unit.toLowerCase()}`;
    if (!aggregated[key]) aggregated[key] = { name, unit, total: 0 };
    aggregated[key].total += quantity;
};

// Build weekly shopping list grouped by category
const generateShoppingList = (personCount, user) => {
    const aggregated = {};
    const today = new Date();
    const start = new Date(user.startDate);

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const diffTime = Math.abs(date - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weekNumber = Math.ceil(diffDays / 7);

        const plan = getMasterDayPlanData(user, date, weekNumber, false);
        if (!plan || !plan.meals) continue;

        plan.meals.forEach((meal) => {
            if (meal.type === 'choice' && Array.isArray(meal.options)) {
                // Aggregate all options conservatively
                meal.options.forEach((opt) => {
                    (opt.ingredients || []).forEach((ing) => processIngredient(ing, aggregated));
                });
            } else {
                (meal.ingredients || []).forEach((ing) => processIngredient(ing, aggregated));
            }
        });
    }

    const categorized = {};
    for (const key in aggregated) {
        const { name, unit, total } = aggregated[key];
        const category = getCategoryForIngredient(name);
        if (!categorized[category]) categorized[category] = [];
        categorized[category].push({ name, unit, quantity: Math.ceil(total * personCount) });
    }
    return categorized;
};

const getTimeStatus = (timeStr) => {
    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const eventTime = new Date();
    eventTime.setHours(hours, minutes, 0, 0);

    const diffMinutes = (now.getTime() - eventTime.getTime()) / 1000 / 60;

    if (diffMinutes < 0) return 'upcoming';
    if (diffMinutes <= 60) return 'due';
    return 'overdue';
};

const DashboardNotifications = ({ user, progress, updateProgress, fastingDays }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    const today = new Date();
    const dateString = today.toISOString().slice(0, 10);
    const isFastingDay = !!fastingDays[dateString];

    const dayPlan = useMemo(() => {
        if (isFastingDay) return { meals: [], workout: null, supplements: [] };
        const start = new Date(user.startDate);
        const diffTime = Math.abs(today - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weekNumber = Math.ceil(diffDays / 7);
        return getMasterDayPlanData(user, today, weekNumber, false);
    }, [user, dateString, isFastingDay]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const incompleteTasks = useMemo(() => {
        const allTodayTasks = [];

        const mealIcon = dailySchedule.find(e => e.type === 'meal')?.icon || '🍽️';

        // 1. Add meals from dayPlan
        if (dayPlan && dayPlan.meals) {
            dayPlan.meals.forEach(meal => {
                allTodayTasks.push({
                    id: `meal_${dayPlan.dayName}_${meal.time.replace(':', '')}`,
                    time: meal.time,
                    title: meal.name,
                    icon: mealIcon,
                    type: 'meal',
                });
            });
        }
        
        // 2. Add other events from dailySchedule (which includes supplements and activities)
        dailySchedule.forEach(event => {
            // Meals are handled above from the specific day plan.
            if (event.type !== 'meal') {
                 allTodayTasks.push({
                    id: `event_${event.time}_${event.title.replace(/\s+/g, '_')}`,
                    time: event.time,
                    title: event.title,
                    icon: event.icon,
                    type: event.type,
                });
            }
        });

        // Map over the combined list to add completion and status info
        return allTodayTasks
            .map(task => ({
                ...task,
                isCompleted: !!progress[task.id],
                status: getTimeStatus(task.time)
            }))
            .filter(task => !task.isCompleted)
            .sort((a, b) => a.time.localeCompare(b.time));

    }, [progress, currentTime, dayPlan]);


    if (incompleteTasks.length === 0) {
        return (
            <div className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5 text-center">
                 <p className="font-semibold text-slate-700">🎉</p>
                <p className="font-semibold text-slate-700 mt-1">Tutto completato per oggi!</p>
                <p className="text-xs text-slate-500">Ottimo lavoro.</p>
            </div>
        )
    }

    const statusStyles = {
        upcoming: 'bg-blue-500/10 border-blue-500/20 text-blue-800',
        due: 'bg-orange-500/10 border-orange-500/20 text-orange-800',
        overdue: 'bg-red-500/10 border-red-500/20 text-red-800',
    };

    return (
        <div className="space-y-3">
             <h2 className="text-lg font-bold text-slate-800 text-center">Da Fare Oggi</h2>
             {incompleteTasks.map(task => {
                const timeToNext = () => {
                     const now = new Date();
                     const [h, m] = task.time.split(':').map(Number);
                     const eventTime = new Date(now);
                     eventTime.setHours(h, m, 0, 0);

                     if(now > eventTime) {
                         const diffMs = now - eventTime;
                         const diffMins = Math.round(diffMs / 60000);
                         if (diffMins > 60) return `Scaduto da ${Math.floor(diffMins/60)}h`;
                         return `Scaduto da ${diffMins}m`;
                     } else {
                         const diffMs = eventTime - now;
                         const diffMins = Math.round(diffMs / 60000);
                         const hours = Math.floor(diffMins / 60);
                         const minutes = diffMins % 60;
                         return `tra ${hours > 0 ? `${hours}h ` : ''}${minutes}min`;
                     }
                };

                 return (
                     <div key={task.id} className={`p-3 rounded-xl border flex items-center justify-between ${statusStyles[task.status]}`}>
                         <div className="flex items-center">
                             <span className="text-2xl mr-3">{task.icon}</span>
                             <div>
                                 <p className="font-semibold">{task.title}</p>
                                 <p className="text-sm font-bold opacity-80">{timeToNext()}</p>
                             </div>
                         </div>
                         <input
                             type="checkbox"
                             id={task.id}
                             checked={task.isCompleted}
                             onChange={() => updateProgress(task.id, !task.isCompleted)}
                             className={`h-6 w-6 rounded-full border-slate-300 focus:ring-offset-2 ${
                                 task.status === 'upcoming' ? 'text-blue-600 focus:ring-blue-500' :
                                 task.status === 'due' ? 'text-orange-600 focus:ring-orange-500' :
                                 'text-red-600 focus:ring-red-500'
                             }`}
                         />
                     </div>
                 )
             })}
        </div>
    );
};


const AlimentareContent = ({ plan, progress, updateProgress }) => (
    <div className="space-y-3 pt-2">
        {plan.meals.map(meal => {
            const mealId = `meal_${plan.dayName}_${meal.time.replace(':', '')}`;
            const isCompleted = progress[mealId] || false;
            return (
                <div key={mealId} className={`p-3 rounded-lg border ${isCompleted ? 'bg-green-500/10 border-green-500/20' : 'bg-slate-500/10 border-slate-500/20'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-slate-500">{meal.time}</p>
                            <p className="font-bold text-slate-800">{meal.name}</p>
                            {meal.calories && <p className="text-xs text-slate-400">~{meal.calories} kcal / {meal.protein}g prot.</p>}
                        </div>
                        <input type="checkbox" id={mealId} checked={isCompleted} onChange={() => updateProgress(mealId, !isCompleted)} className="h-5 w-5 rounded-full text-green-600 focus:ring-green-500" />
                    </div>

                    {meal.type === 'choice' ? (
                        <Accordion title="Opzioni Colazione">
                            <div className="space-y-2">
                                {meal.options.map((option, index) => (
                                    <div key={index} className="p-2 bg-slate-200/50 rounded-md">
                                        <p className="font-bold text-slate-800 text-xs">{option.name}</p>
                                        <p className="text-xs text-slate-500">~{option.calories} kcal / {option.protein}g prot.</p>
                                        <p className="text-xs mt-1"><strong>Ingredienti:</strong> {option.ingredients.join(', ')}.</p>
                                        <p className="text-xs"><strong>Prep:</strong> {option.prep}</p>
                                    </div>
                                ))}
                            </div>
                        </Accordion>
                    ) : (
                        meal.ingredients && meal.prep && <Accordion title="Dettagli Ricetta"><p><strong>Ingredienti:</strong> {meal.ingredients.join(', ')}.</p><p><strong>Preparazione:</strong> {meal.prep}</p></Accordion>
                    )}
                </div>
            );
        })}
    </div>
);

const IntegrazioneContent = ({ plan, progress, updateProgress }) => (
    <div className="space-y-3 pt-2">
        {plan.supplements && plan.supplements.map((supGroup, index) => {
            const groupId = `sup_${plan.dayName}_${supGroup.time.replace(':', '')}_${index}`;
            const isCompleted = progress[groupId] || false;
            return (
                <div key={groupId} className={`p-3 rounded-lg border ${isCompleted ? 'bg-green-500/10 border-green-500/20' : 'bg-slate-500/10 border-slate-500/20'}`}>
                    <div className="flex justify-between items-start">
                        <p className="font-bold text-slate-800">{supGroup.time}</p>
                        <input type="checkbox" id={groupId} checked={isCompleted} onChange={() => updateProgress(groupId, !isCompleted)} className="h-5 w-5 rounded-full text-green-600 focus:ring-green-500" />
                    </div>
                    <ul className="mt-1 space-y-1">
                        {supGroup.items.map(item => (
                            <li key={item.name} className="text-xs text-slate-700">{item.name}: <span className="font-semibold">{item.dose}</span></li>
                        ))}
                    </ul>
                </div>
            );
        })}
    </div>
);

// Minimal HydrationTracker to avoid missing component
const HydrationTracker = ({ progress, updateProgress }) => {
    const todayKey = 'hydration_glasses_';
    const glasses = Array.from({ length: 8 }).map((_, i) => `${todayKey}${i + 1}`);
    const completed = glasses.reduce((acc, key) => acc + (progress[key] ? 1 : 0), 0);
    return (
        <div className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5">
            <h3 className="font-bold text-slate-800 mb-2">Idratazione</h3>
            <p className="text-sm text-slate-600 mb-3">Bicchieri bevuti: <span className="font-bold">{completed}/8</span></p>
            <div className="grid grid-cols-4 gap-2">
                {glasses.map((key) => (
                    <label key={key} className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer ${progress[key] ? 'bg-blue-500/10 border-blue-400 text-blue-700' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={!!progress[key]}
                            onChange={(e) => updateProgress(key, e.target.checked)}
                        />
                        💧
                    </label>
                ))}
            </div>
        </div>
    );
};

const FastingTracker = ({ user, fastingState, setFastingState }) => {
    const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Pronto a iniziare");

    // Configurable fasting/eating hours
    const fastingHours = 16;
    const eatingHours = 8;
    const fastingDurationSeconds = fastingHours * 3600;
    const eatingDurationSeconds = eatingHours * 3600;

    const fastStartTime = fastingState.isActive ? new Date(fastingState.startTime) : null;
    const fastEndTime = fastStartTime ? new Date(fastStartTime.getTime() + fastingDurationSeconds * 1000) : null;
    const eatEndTime = fastEndTime ? new Date(fastEndTime.getTime() + eatingDurationSeconds * 1000) : null;

    useEffect(() => {
        const timer = setInterval(() => {
            if (!fastingState.isActive || !fastStartTime || !fastEndTime || !eatEndTime) {
                setStatusText("Ora puoi mangiare");
                setTime({ hours: eatingHours, minutes: 0, seconds: 0 });
                setProgress(100);
                return;
            }

            const now = new Date();
            const elapsedSeconds = Math.floor((now.getTime() - fastStartTime.getTime()) / 1000);

            if (now < fastEndTime) {
                // FASTING PERIOD
                const remainingSeconds = fastingDurationSeconds - elapsedSeconds;
                setTime({
                    hours: Math.floor(remainingSeconds / 3600),
                    minutes: Math.floor((remainingSeconds % 3600) / 60),
                    seconds: remainingSeconds % 60
                });
                setProgress((elapsedSeconds / fastingDurationSeconds) * 100);
                setStatusText("Stai digiunando");
            } else if (now < eatEndTime) {
                // EATING PERIOD
                const eatingElapsedSeconds = elapsedSeconds - fastingDurationSeconds;
                const remainingSeconds = eatingDurationSeconds - eatingElapsedSeconds;
                setTime({
                    hours: Math.floor(remainingSeconds / 3600),
                    minutes: Math.floor((remainingSeconds % 3600) / 60),
                    seconds: remainingSeconds % 60
                });
                // Progress circle shows progress of eating window
                setProgress((eatingElapsedSeconds / eatingDurationSeconds) * 100);
                setStatusText("Ora puoi mangiare");
            } else {
                // Cycle finished, reset
                setFastingState({ startTime: null, isActive: false });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [fastingState, setFastingState, eatEndTime, eatingDurationSeconds, eatingHours, fastEndTime, fastStartTime, fastingDurationSeconds]);

    const handleToggleFasting = () => {
        setFastingState(prev => {
            if (prev.isActive) {
                // Stop fasting
                return { startTime: null, isActive: false };
            } else {
                // Start fasting
                return { startTime: new Date().toISOString(), isActive: true };
            }
        });
    };

    const formatDate = (date) => {
        if (!date) return '--:--';
        return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    };

    const progressColorClass = (fastingState.isActive && fastEndTime && new Date() < fastEndTime) ? "text-orange-500" : "text-green-500";

    return (
        <div className="py-4 text-center space-y-4">
            <div className="relative w-48 h-48 mx-auto">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-slate-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                    <circle
                        className={progressColorClass}
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 45}
                        strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-sm font-semibold text-slate-600">{statusText}</p>
                    <p className="text-4xl font-mono font-bold text-slate-800">
                        {`${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`}
                    </p>
                </div>
            </div>

            <button onClick={handleToggleFasting} className={`w-full px-4 py-3 rounded-full font-semibold text-white shadow-md transition-colors ${fastingState.isActive ? 'bg-orange-500/90 hover:bg-orange-500' : 'bg-green-500/90 hover:bg-green-500'}`}>
                {fastingState.isActive ? 'Interrompi Digiuno' : 'Inizia a Digiunare'}
            </button>

            <div className="flex justify-between text-sm pt-2">
                <div className="text-left">
                    <p className="text-slate-500">Inizio Finestra Cibo</p>
                    <p className="font-semibold text-slate-700">{formatDate(fastEndTime)}</p>
                </div>
                <div className="text-right">
                    <p className="text-slate-500">Fine Finestra Cibo</p>
                    <p className="font-semibold text-slate-700">{formatDate(eatEndTime)}</p>
                </div>
            </div>
        </div>
    );
};


const DayAccordion = forwardRef(({ date, isToday, progress, updateProgress, activeTab, weekNumber, user, isFastingDay, toggleFastingDay, fastingState, setFastingState }, ref) => {
    const [isOpen, setIsOpen] = useState(isToday);
    const dayPlan = getMasterDayPlanData(user, date, weekNumber, isFastingDay);

    const totals = useMemo(() => {
        if (!dayPlan || !dayPlan.meals) {
            return { calories: 0, protein: 0 };
        }
        const totalCalories = dayPlan.meals.reduce((sum, meal) => {
            if (meal.type === 'choice' && meal.options) {
                // Average calories for choice meals, or use the first option
                return sum + (meal.options.reduce((s, o) => s + o.calories, 0) / meal.options.length);
            }
            return sum + (meal.calories || 0);
        }, 0);
        const totalProtein = dayPlan.meals.reduce((sum, meal) => {
            if (meal.type === 'choice' && meal.options) {
                return sum + (meal.options.reduce((s, o) => s + o.protein, 0) / meal.options.length);
            }
            return sum + (meal.protein || 0);
        }, 0);
        return { calories: Math.round(totalCalories), protein: Math.round(totalProtein) };
    }, [dayPlan]);

    return (
        <div ref={ref} className={`bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5 transition-all duration-300 ${isToday ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-100' : ''}`}>
            <div onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left cursor-pointer">
                <div>
                    <p className="text-sm text-slate-500">{date.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                    <h3 className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-slate-800'}`}>{isFastingDay ? "GIORNO DI DIGIUNO ⏱️" : dayPlan.dayName}</h3>
                    {!isFastingDay && (totals.calories > 0 || totals.protein > 0) && activeTab === 'alimentare' &&
                        <div className="flex items-center gap-2 flex-wrap mt-1 text-xs">
                            <span className="font-semibold text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded-full">🔥 {totals.calories} kcal</span>
                            <span className="font-semibold text-teal-600 bg-teal-500/10 px-2 py-0.5 rounded-full">💪 {totals.protein} g</span>
                        </div>
                    }
                </div>
                 <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFastingDay();
                        }}
                        className={`px-2 py-1 text-xs rounded-full transition-colors ${isFastingDay ? 'bg-blue-600 text-white shadow' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                        {isFastingDay ? '✓ Digiuno' : 'Digiuna'}
                    </button>
                    <span className={`text-3xl transition-transform ${isOpen ? 'rotate-45' : ''} ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>+</span>
                </div>
            </div>
            {isOpen && (
                <div className="px-4 pb-4 border-t border-slate-200/50 space-y-4">
                     {isFastingDay ? (
                        <FastingTracker user={user} fastingState={fastingState} setFastingState={setFastingState} />
                    ) : (
                        <>
                            {activeTab === 'alimentare' && <AlimentareContent plan={dayPlan} progress={progress} updateProgress={updateProgress} />}
                            {activeTab === 'integrazione' && <IntegrazioneContent plan={dayPlan} progress={progress} updateProgress={updateProgress} />}
                        </>
                    )}
                </div>
            )}
        </div>
    );
});
DayAccordion.displayName = 'DayAccordion';

const PlanScreen = ({ progress, updateProgress, isScrolled, user, fastingDays, setFastingDays, fastingState, setFastingState }) => {
    const [activePlanTab, setActivePlanTab] = useState('alimentare');
    const todayRef = useRef(null);
    const [weekNumber, setWeekNumber] = useState(1);
    
    useEffect(() => {
        const start = new Date(user.startDate);
        const today = new Date();
        const diffTime = Math.abs(today - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setWeekNumber(Math.ceil(diffDays / 7));
    }, [user.startDate]);    
    useEffect(() => {
        if (['alimentare', 'integrazione'].includes(activePlanTab) && todayRef.current) {
            const timer = setTimeout(() => {
                todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [activePlanTab]);

    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1));

    const daysToShow = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(d.getDate() + i);
        return d;
    });

    const PlanTabButton = ({ title, icon, active, onPress }) => (
        <button onClick={onPress} className={`py-2 px-4 font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 flex-1 ${active ? 'bg-slate-900 text-white shadow-md' : 'bg-transparent text-slate-600'}`}>
            {icon && <span>{icon}</span>}
            <span>{title}</span>
        </button>
    );

    const stickyTopClass = isScrolled ? 'top-20' : 'top-4';

    return (
        <div className="space-y-4">
            <div className={`p-1 bg-white/60 backdrop-blur-xl border border-white/20 rounded-full flex justify-around sticky z-10 transition-all duration-300 ${stickyTopClass}`}>
                <PlanTabButton title="Alimentare" active={activePlanTab === 'alimentare'} onPress={() => setActivePlanTab('alimentare')} />
                <PlanTabButton title="Integrazione" active={activePlanTab === 'integrazione'} onPress={() => setActivePlanTab('integrazione')} />
                <PlanTabButton title="Idratazione" active={activePlanTab === 'idratazione'} onPress={() => setActivePlanTab('idratazione')} />
            </div>

            {(activePlanTab === 'alimentare' || activePlanTab === 'integrazione') && daysToShow.map((date, idx) => (
                <DayAccordion
                    key={idx}
                    date={date}
                    isToday={date.toDateString() === today.toDateString()}
                    ref={date.toDateString() === today.toDateString() ? todayRef : null}
                    progress={progress}
                    updateProgress={updateProgress}
                    activeTab={activePlanTab}
                    weekNumber={weekNumber}
                    user={user}
                    isFastingDay={!!fastingDays[date.toISOString().slice(0, 10)]}
                    fastingState={fastingState}
                    setFastingState={setFastingState}
                    toggleFastingDay={() => {
                        const dateString = date.toISOString().slice(0, 10);
                        setFastingDays(prev => ({
                            ...prev,
                            [dateString]: !prev[dateString]
                        }));
                    }}
                />
            ))}

            {activePlanTab === 'idratazione' && <HydrationTracker progress={progress} updateProgress={updateProgress} />}
        </div>
    );
};

// Helper hook to calculate days until next Monday
const useDaysUntilNextMonday = () => {
    const [days, setDays] = useState(0);

    useEffect(() => {
        const calculateDays = () => {
            const today = new Date();
            const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1
            const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7;
            setDays(daysUntilMonday);
        };
        calculateDays();
        // Recalculate at midnight
        const now = new Date();
        const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0) - now;
        const timeoutId = setTimeout(calculateDays, msUntilMidnight);
        return () => clearTimeout(timeoutId);
    }, []);

    return days;
};

const InfoBar = ({ label, consumed, total, unit, colorClass = 'bg-blue-500' }) => {
    const percentage = total > 0 ? Math.min((consumed / total) * 100, 100) : 0;
    return (
        <div>
            <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">{label}</span>
                <span className="text-slate-500">{Math.round(consumed)} / {total} {unit}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className={`${colorClass} h-1.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    )
};

// Lightweight banner showing time until eating window opens
const FastingNotification = ({ user, fastingState }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const fastingHours = 16; // default pattern 16-8
    const fastingDurationSeconds = fastingHours * 3600;

    useEffect(() => {
        if (!fastingState?.isActive || !fastingState?.startTime) {
            setTimeLeft('Finestra cibo aperta!');
            return;
        }

        const calculateTime = () => {
            const now = new Date();
            const fastStartTime = new Date(fastingState.startTime);
            const fastEndTime = new Date(fastStartTime.getTime() + fastingDurationSeconds * 1000);

            if (now < fastEndTime) {
                const remainingSeconds = Math.floor((fastEndTime.getTime() - now.getTime()) / 1000);
                if (remainingSeconds <= 0) {
                    setTimeLeft('Finestra cibo aperta!');
                    return;
                }
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);
                const seconds = remainingSeconds % 60;
                setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            } else {
                setTimeLeft('Finestra cibo aperta!');
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [fastingState, fastingDurationSeconds]);

    if (!fastingState?.isActive) return null;

    return (
        <div className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5 flex items-center justify-center gap-3">
            <span className="text-2xl">⏱️</span>
            <div>
                <p className="font-semibold text-slate-800 text-center">
                    {timeLeft === 'Finestra cibo aperta!' ? timeLeft : `Finestra Cibo tra:`}
                </p>
                {timeLeft !== 'Finestra cibo aperta!' && (
                    <p className="text-2xl font-bold text-slate-800 text-center font-mono">{timeLeft}</p>
                )}
            </div>
        </div>
    );
};

const DailySummary = ({ summary }) => {
    const { totals, consumed, burnedCalories } = summary;
    const remaining = totals.calories - consumed.calories + burnedCalories;
    return (
        <div className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5 space-y-4">
            <div className="flex items-center justify-around text-center">
                <div>
                    <p className="text-lg font-bold text-slate-800">{consumed.calories}</p>
                    <p className="text-xs text-slate-500">Mangiate</p>
                </div>
                 <div className="relative">
                    <svg className="w-24 h-24" viewBox="0 0 36 36">
                       <path
                         className="text-slate-200"
                         d="M18 2.0845
                           a 15.9155 15.9155 0 0 1 0 31.831
                           a 15.9155 15.9155 0 0 1 0 -31.831"
                         fill="none"
                         stroke="currentColor"
                         strokeWidth="2"
                       />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <p className="text-2xl font-bold text-slate-800">{remaining}</p>
                         <p className="text-xs text-slate-500 -mt-1">Rimanenti</p>
                    </div>
                </div>
                <div>
                     <p className="text-lg font-bold text-slate-800">{burnedCalories}</p>
                    <p className="text-xs text-slate-500">Bruciate</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/50">
                <InfoBar label="Proteine" consumed={consumed.protein} total={totals.protein} unit="g" colorClass="bg-teal-500" />
                <InfoBar label="Calorie" consumed={consumed.calories} total={totals.calories} unit="kcal" colorClass="bg-orange-500"/>
                <InfoBar label="Grassi" consumed={consumed.fats} total={totals.fats} unit="g" colorClass="bg-yellow-500" />
            </div>
        </div>
    );
};

const OggiScreen = ({ user, progress, updateProgress, fastingDays, fastingState, isScrolled }) => {
    const todayString = new Date().toISOString().slice(0, 10);
    const isTodayFasting = !!fastingDays[todayString];
    const daysToGoal = useCountdown(user.endDate);
    const daysToNextMeasurement = useDaysUntilNextMonday();
    const dailyMacros = useDailyMacros(user, progress, fastingDays);

    return (
        <div className="space-y-6">
             <DailySummary summary={dailyMacros} />
            
            {isTodayFasting && fastingState.isActive ? (
                <FastingNotification user={user} fastingState={fastingState} />
            ) : (
                <DashboardNotifications 
                    user={user} 
                    progress={progress} 
                    updateProgress={updateProgress} 
                    fastingDays={fastingDays} 
                />
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5 text-center">
                    <p className="text-sm font-semibold text-slate-600">Prossima Misurazione</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">
                        {daysToNextMeasurement}
                    </p>
                    <p className="text-xs text-slate-500">{daysToNextMeasurement === 1 ? 'giorno' : 'giorni'}</p>
                </div>
                <div className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5 text-center">
                    <p className="text-sm font-semibold text-slate-600">Traguardo Finale</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">
                        {daysToGoal}
                    </p>
                     <p className="text-xs text-slate-500">{typeof daysToGoal === 'number' ? 'giorni' : ''}</p>
                </div>
            </div>
        </div>
    );
};

const WeeklyMeasurementForm = ({ onSave, initialValues, onClose, user }) => {
    const [measurements, setMeasurements] = useState({
        weight: initialValues?.weight > 0 ? initialValues.weight.toFixed(1) : '',
        bodyFat: initialValues?.bodyFat > 0 ? initialValues.bodyFat.toFixed(1) : '',
        arms: initialValues?.arms > 0 ? initialValues.arms.toFixed(1) : '',
        waist: initialValues?.waist > 0 ? initialValues.waist.toFixed(1) : '',
        neck: initialValues?.neck > 0 ? initialValues.neck.toFixed(1) : '',
        hips: initialValues?.hips > 0 ? initialValues.hips.toFixed(1) : '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMeasurements(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const numericMeasurements = {};
        for (const key in measurements) {
            numericMeasurements[key] = parseFloat(measurements[key]) || 0;
        }
        numericMeasurements.chest = initialValues?.chest || 0;
        onSave(numericMeasurements);
    };

    const labels = {
        weight: 'Peso (kg)',
        bodyFat: 'Massa Grassa (%)',
        arms: 'Braccia (cm)',
        waist: 'Vita (cm)',
        neck: 'Collo (cm)',
        hips: 'Fianchi (cm)',
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg text-center">Inserisci le Misure di Questa Settimana</h3>
            <div className="grid grid-cols-2 gap-4">
                {Object.keys(labels).map(key => (
                    <div key={key}>
                        <label htmlFor={key} className="block text-sm font-semibold text-slate-700">{labels[key]}</label>
                        <input
                            type="number"
                            step="0.1"
                            name={key}
                            id={key}
                            value={measurements[key]}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                            required
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-full font-semibold bg-slate-200/90 hover:bg-slate-300 text-slate-800 shadow-sm transition-colors">
                    Annulla
                </button>
                <button type="submit" className="px-4 py-2 rounded-full font-semibold text-white shadow-md transition-colors bg-green-500/90 hover:bg-green-500">
                    Salva Misurazione
                </button>
            </div>
        </form>
    );
};

const ProgressoScreen = ({ user, onUpdateUser }) => {
    const [weeklyData, addWeeklyEntry] = useWeeklyProgress('progetto80_weekly_progress', user);
    const [isMeasurementDue, setIsMeasurementDue] = useState(false);
    const [isFormExpanded, setIsFormExpanded] = useState(false);
    const [message, setMessage] = useState('');

    const [finalGoal, setFinalGoal] = useState(user.goalWeight || '');
    const [intermediateGoal, setIntermediateGoal] = useState(user.intermediateGoalWeight || '');

    useEffect(() => {
        setFinalGoal(user.goalWeight || '');
        setIntermediateGoal(user.intermediateGoalWeight || '');
    }, [user.goalWeight, user.intermediateGoalWeight]);

    const handleSaveGoals = () => {
        const finalGoalNum = parseFloat(finalGoal);
        const intermediateGoalNum = parseFloat(intermediateGoal);
        const latestWeight = weeklyData.length > 0 ? weeklyData[weeklyData.length - 1].weight : user.startWeight;
        
        if (isNaN(finalGoalNum) || finalGoalNum >= latestWeight) {
            setMessage("L'obiettivo finale deve essere un numero inferiore al peso attuale.");
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        if (isNaN(intermediateGoalNum) || intermediateGoalNum >= latestWeight || intermediateGoalNum <= finalGoalNum) {
            setMessage("L'obiettivo intermedio deve essere inferiore al peso attuale e superiore a quello finale.");
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        const lossPerWeekKg = 0.7; // Assumed average weight loss per week
        const weeksToFinalGoal = (latestWeight - finalGoalNum) / lossPerWeekKg;
        
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + Math.ceil(weeksToFinalGoal * 7));

        const updatedUser = {
            ...user,
            goalWeight: finalGoalNum,
            intermediateGoalWeight: intermediateGoalNum,
            endDate: newEndDate.toISOString().slice(0, 10),
            durationWeeks: Math.ceil(weeksToFinalGoal),
            // Reset the start point for the new goal plan
            startDate: new Date().toISOString().slice(0, 10),
            startWeight: latestWeight,
        };
        
        onUpdateUser(updatedUser);
        setMessage('Obiettivi salvati con successo!');
        setTimeout(() => setMessage(''), 3000);
    };


    const latestMeasurementsForDisplay = useMemo(() => {
        if (weeklyData.length > 0) {
            return weeklyData[weeklyData.length - 1];
        }
        const startDate = new Date(user.startDate);
        const endDate = new Date(user.endDate);
        const today = new Date();
        const totalDuration = endDate.getTime() - startDate.getTime();
        const elapsedDuration = Math.max(0, today.getTime() - startDate.getTime());
        const progress = Math.min(1, elapsedDuration / totalDuration);

        const interpolatedData = {};
        for (const key in user.startMeasurements) {
            const start = user.startMeasurements[key];
            const goal = user.goalMeasurements[key];
            interpolatedData[key] = start + (goal - start) * progress;
        }
        return interpolatedData;
    }, [weeklyData, user]);

    const latestMeasurementsForInput = weeklyData.length > 0 ? weeklyData[weeklyData.length - 1] : user.startMeasurements;

    useEffect(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const lastEntryDate = weeklyData.length > 0 ? new Date(weeklyData[weeklyData.length - 1].date) : null;

        if (!lastEntryDate || lastEntryDate < startOfWeek) {
            setIsMeasurementDue(true);
        } else {
            setIsMeasurementDue(false);
            setIsFormExpanded(false);
        }
    }, [weeklyData]);

    const handleSaveMeasurements = (newData) => {
        addWeeklyEntry(newData);
        setIsFormExpanded(false);
    };

    const currentLoss = user.startWeight - latestMeasurementsForDisplay.weight;

    const bmi = latestMeasurementsForDisplay.weight / ((user.height / 100) ** 2);
    const getBmiStatus = (bmiValue) => {
        if (bmiValue < 18.5) return { status: "Sottopeso", color: "bg-blue-400" };
        if (bmiValue >= 18.5 && bmiValue < 25) return { status: "Normopeso", color: "bg-green-500" };
        if (bmiValue >= 25 && bmiValue < 30) return { status: "Sovrappeso", color: "bg-yellow-400" };
        return { status: "Obeso", color: "bg-red-500" };
    };
    const bmiInfo = getBmiStatus(bmi);
    const bmiMin = 15;
    const bmiMax = 40;
    const bmiPositionPercent = Math.max(0, Math.min(100, ((bmi - bmiMin) / (bmiMax - bmiMin)) * 100));

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 text-center">I Tuoi Progressi ⚖️</h2>

            {isMeasurementDue && (
                <div className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5 space-y-4">
                    {!isFormExpanded ? (
                        <div className="text-center">
                            <h3 className="font-bold text-slate-800 mb-2">Check-in Settimanale</h3>
                            <p className="text-sm text-slate-600 mb-3">È ora di registrare i tuoi progressi per questa settimana!</p>
                            <button
                                onClick={() => setIsFormExpanded(true)}
                                className="w-full px-4 py-3 rounded-full font-semibold text-white shadow-md transition-colors bg-blue-500/90 hover:bg-blue-500"
                            >
                                Aggiungi Misurazione
                            </button>
                        </div>
                    ) : (
                        <WeeklyMeasurementForm
                            onSave={handleSaveMeasurements}
                            initialValues={latestMeasurementsForInput}
                            onClose={() => setIsFormExpanded(false)}
                            user={user}
                        />
                    )}
                </div>
            )}
            
            <div className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5 space-y-4">
                <h3 className="font-bold text-slate-800 text-lg text-center">Imposta Obiettivi</h3>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="intermediateGoal" className="block text-sm font-semibold text-slate-700">Obiettivo Intermedio (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            id="intermediateGoal"
                            value={intermediateGoal}
                            onChange={(e) => setIntermediateGoal(e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                        />
                    </div>
                     <div>
                        <label htmlFor="finalGoal" className="block text-sm font-semibold text-slate-700">Obiettivo Finale (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            id="finalGoal"
                            value={finalGoal}
                            onChange={(e) => setFinalGoal(e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                        />
                    </div>
                </div>
                <button onClick={handleSaveGoals} className="w-full px-4 py-2 rounded-full font-semibold text-white shadow-md transition-colors bg-green-500/90 hover:bg-green-500">
                    Salva Obiettivi
                </button>
                {message && <p className="text-center text-sm font-semibold text-slate-600 mt-2">{message}</p>}
            </div>


            <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5 text-center">
                    <p className="text-xs text-slate-500">Iniziale</p>
                    <p className="font-bold text-slate-800">{user.startWeight} kg</p>
                </div>
                <div className="p-3 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5 text-center">
                    <p className="text-xs text-slate-500">Attuale</p>
                    <p className="font-bold text-slate-800">{latestMeasurementsForDisplay.weight.toFixed(1)} kg</p>
                </div>
                <div className="p-3 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5 text-center">
                    <p className="text-xs text-slate-500">Persi</p>
                    <p className="font-bold text-green-600">-{currentLoss.toFixed(1)} kg</p>
                </div>
            </div>

            <div className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5">
                <h3 className="font-bold text-slate-800 mb-3">Indice di Massa Corporea (IMC)</h3>
                <div className="w-full h-4 flex rounded-full overflow-hidden">
                    <div className="bg-blue-400" style={{ width: '25%' }}></div>
                    <div className="bg-green-500" style={{ width: '35%' }}></div>
                    <div className="bg-yellow-400" style={{ width: '20%' }}></div>
                    <div className="bg-red-500" style={{ width: '20%' }}></div>
                </div>
                <div className="relative h-4 -mt-4">
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${bmiPositionPercent}%` }}>
                        <div className="w-5 h-5 bg-white rounded-full shadow-lg border-2 border-slate-400 flex items-center justify-center">
                            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-3">
                    <p className="font-bold text-slate-800">{bmi.toFixed(1)} <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${bmiInfo.color}`}>{bmiInfo.status}</span></p>
                </div>
            </div>

            <div className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5">
                <h3 className="font-bold text-slate-800 mb-3">I Tuoi Obiettivi Settimanali</h3>
                <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase sticky top-0 bg-white/80 backdrop-blur-sm">
                            <tr>
                                <th className="py-2 px-2">Settimana</th>
                                <th className="py-2 px-2">Atteso</th>
                                <th className="py-2 px-2">Raggiunto</th>
                                <th className="py-2 px-2 text-center">Stato</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/50">
                            {useMemo(() => {
                                const goals = [];
                                const weeklyLoss = (user.startWeight - user.goalWeight) / user.durationWeeks;
                                for (let i = 1; i <= user.durationWeeks; i++) {
                                    const targetWeight = user.startWeight - (i * weeklyLoss);
                                    const weekStartDate = new Date(user.startDate);
                                    weekStartDate.setDate(weekStartDate.getDate() + (i - 1) * 7);
                                    const weekEndDate = new Date(weekStartDate);
                                    weekEndDate.setDate(weekEndDate.getDate() + 7);

                                    const entryForWeek = weeklyData.find(entry => {
                                        const entryDate = new Date(entry.date);
                                        return entryDate >= weekStartDate && entryDate < weekEndDate;
                                    });

                                    goals.push({
                                        week: i,
                                        target: targetWeight.toFixed(1),
                                        achieved: entryForWeek ? entryForWeek.weight.toFixed(1) : '-',
                                        status: entryForWeek ? (entryForWeek.weight <= targetWeight ? '✅' : '❌') : '⏳'
                                    });
                                }
                                return goals;
                            }, [weeklyData, user]).map(goal => (
                                <tr key={goal.week}>
                                    <td className="py-2 px-2 font-semibold text-slate-700">{goal.week}</td>
                                    <td className="py-2 px-2 text-slate-600">{goal.target} kg</td>
                                    <td className="py-2 px-2 text-slate-600">{goal.achieved}{goal.achieved !== '-' ? ' kg' : ''}</td>
                                    <td className="py-2 px-2 text-center">{goal.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const ExerciseItem = ({ exercise, dayName, progress, updateProgress }) => {
    const baseId = `workout_${dayName}_${exercise.name.replace(/\s+/g, '_')}`;
    const completedId = `${baseId}_completed`;
    const weightId = `${baseId}_weight`;
    const inclineId = `${baseId}_incline`;
    const speedId = `${baseId}_speed`;
    const levelId = `${baseId}_level`;

    const isCompleted = progress[completedId] || false;
    const numSets = useMemo(() => parseSets(exercise.sets), [exercise.sets]);
    const isCircuit = Array.isArray(exercise.details) && exercise.details.length > 0 && typeof exercise.details[0] === 'object';

    const allSetIds = useMemo(() => {
        if (isCircuit) {
            return exercise.details.flatMap(subEx => {
                const subBaseId = `${baseId}_${subEx.name.replace(/\s+/g, '_')}`;
                const numSubSets = parseSets(subEx.sets);
                return Array.from({ length: numSubSets }, (_, i) => `${subBaseId}_set_${i}`);
            });
        }
        if (numSets > 1) {
            return Array.from({ length: numSets }, (_, i) => `${baseId}_set_${i}`);
        }
        return [];
    }, [exercise.details, baseId, isCircuit, numSets]);

    const completedSetsCount = useMemo(() => allSetIds.filter(id => progress[id]).length, [allSetIds, progress]);
    const allSetsDone = useMemo(() => allSetIds.length > 0 && completedSetsCount === allSetIds.length, [allSetIds, completedSetsCount]);

    useEffect(() => {
        if (allSetIds.length > 0) {
            const isExerciseMarkedComplete = progress[completedId];
            if (allSetsDone && !isExerciseMarkedComplete) {
                updateProgress(completedId, true);
            } else if (!allSetsDone && isExerciseMarkedComplete) {
                updateProgress(completedId, false);
            }
        }
    }, [allSetsDone, completedId, progress, updateProgress, allSetIds]);

    const handleMainCheckboxChange = () => {
        const newValue = !isCompleted;
        updateProgress(completedId, newValue);
        if (allSetIds.length > 0) {
            allSetIds.forEach(id => updateProgress(id, newValue));
        }
    };

    const mainCheckboxRef = useRef(null);
    useEffect(() => {
        if (mainCheckboxRef.current) {
            mainCheckboxRef.current.indeterminate = allSetIds.length > 0 && completedSetsCount > 0 && !allSetsDone;
        }
    }, [completedSetsCount, allSetIds, allSetsDone]);

    return (
        <div className={`p-3 rounded-lg transition-colors ${isCompleted ? 'bg-green-500/10' : 'bg-slate-500/10'}`}>
            <div className="flex gap-3">
                <img
                    src={getExerciseImageUrl(exercise.name)}
                    alt={`Illustrazione per ${exercise.name}`}
                    className="w-24 h-20 object-cover rounded-lg bg-slate-200 flex-shrink-0"
                />
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-slate-800 text-sm">{exercise.name}</p>
                            {exercise.sets && <p className="text-xs text-slate-500">{exercise.sets}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {isCompleted && <span className="text-xs font-bold text-orange-500">-{exercise.calories} kcal</span>}
                            <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={handleMainCheckboxChange}
                                ref={mainCheckboxRef}
                                className="h-5 w-5 rounded-full text-green-600 focus:ring-green-500 border-slate-300" />
                        </div>
                    </div>
                    <div className="mt-2 space-y-2">
                        {exercise.type === 'weights' && (
                            <div className="flex items-center gap-2">
                                <label htmlFor={weightId} className="text-xs font-semibold text-slate-600">Peso (kg):</label>
                                <input
                                    type="number"
                                    id={weightId}
                                    value={progress[weightId] || ''}
                                    onChange={(e) => updateProgress(weightId, e.target.value)}
                                    className="w-20 rounded-md border-slate-300 shadow-sm text-sm p-1 text-center"
                                    placeholder="0.0"
                                />
                            </div>
                        )}
                        {exercise.name === 'TAPIS ROULANT' && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <label htmlFor={inclineId} className="text-xs font-semibold text-slate-600">Pendenza (%):</label>
                                    <input
                                        type="number"
                                        id={inclineId}
                                        value={progress[inclineId] || ''}
                                        onChange={(e) => updateProgress(inclineId, e.target.value)}
                                        className="w-16 rounded-md border-slate-300 shadow-sm text-sm p-1 text-center"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label htmlFor={speedId} className="text-xs font-semibold text-slate-600">Velocità (km/h):</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        id={speedId}
                                        value={progress[speedId] || ''}
                                        onChange={(e) => updateProgress(speedId, e.target.value)}
                                        className="w-16 rounded-md border-slate-300 shadow-sm text-sm p-1 text-center"
                                        placeholder="0.0"
                                    />
                                </div>
                            </div>
                        )}
                        {exercise.name === 'CYCLETTE' && (
                            <div className="flex items-center gap-2">
                                <label htmlFor={levelId} className="text-xs font-semibold text-slate-600">Livello:</label>
                                <input
                                    type="number"
                                    id={levelId}
                                    value={progress[levelId] || ''}
                                    onChange={(e) => updateProgress(levelId, e.target.value)}
                                    className="w-20 rounded-md border-slate-300 shadow-sm text-sm p-1 text-center"
                                    placeholder="0"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {(!isCircuit && numSets > 1) && (
                <div className="mt-3 pt-3 border-t border-slate-200/50">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {Array.from({ length: numSets }).map((_, i) => {
                            const setId = `${baseId}_set_${i}`;
                            return (
                                <div key={setId} className="flex items-center">
                                    <input
                                        type="checkbox" id={setId}
                                        checked={!!progress[setId]}
                                        onChange={(e) => updateProgress(setId, e.target.checked)}
                                        className="h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor={setId} className="ml-1.5 text-sm text-slate-700">Serie {i + 1}</label>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {exercise.details && (
                <div className="mt-2 pt-2 border-t border-slate-200/50">
                    <Accordion title="Dettagli">
                        {isCircuit ? (
                            <div className="space-y-4">
                                {exercise.details.map(subEx => {
                                    const subBaseId = `${baseId}_${subEx.name.replace(/\s+/g, '_')}`;
                                    const numSubSets = parseSets(subEx.sets);
                                    return (
                                        <div key={subBaseId}>
                                            <p className="font-semibold text-slate-700 text-sm">{subEx.name} <span className="font-normal text-slate-500 text-xs">({subEx.sets})</span></p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                                                {Array.from({ length: numSubSets }).map((_, i) => {
                                                    const setId = `${subBaseId}_set_${i}`;
                                                    return (
                                                        <div key={setId} className="flex items-center">
                                                            <input
                                                                type="checkbox" id={setId}
                                                                checked={!!progress[setId]}
                                                                onChange={(e) => updateProgress(setId, e.target.checked)}
                                                                className="h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                                                            />
                                                            <label htmlFor={setId} className="ml-1.5 text-sm text-slate-700">Serie {i + 1}</label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <ul className="list-disc list-inside text-slate-600">
                                {exercise.details.map((detail, i) => <li key={i}>{detail.name ? `${detail.name} (${detail.sets})` : detail}</li>)}
                            </ul>
                        )}
                    </Accordion>
                </div>
            )}
        </div>
    );
};

const WorkoutDayAccordion = forwardRef(({ date, isToday, weekNumber, progress, updateProgress, user }, ref) => {
    const [isOpen, setIsOpen] = useState(isToday);
    const dayPlan = getMasterDayPlanData(user, date, weekNumber);

    const totalCaloriesBurned = dayPlan.workout?.exercises.reduce((total, exercise) => {
        const baseId = `workout_${dayPlan.dayName}_${exercise.name.replace(/\s+/g, '_')}`;
        const completedId = `${baseId}_completed`;
        if (progress[completedId]) {
            return total + (exercise.calories || 0);
        }
        return total;
    }, 0) || 0;

    return (
        <div ref={ref} className={`bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5 transition-all duration-300 ${isToday ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-100' : ''}`}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left">
                <div className="flex items-center">
                    <div>
                        <p className="text-sm text-slate-500">{date.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                        <h3 className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-slate-800'}`}>{dayPlan.dayName}</h3>
                    </div>
                    {totalCaloriesBurned > 0 && <span className="ml-3 text-sm font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full">-{totalCaloriesBurned} kcal</span>}
                </div>
                <span className={`text-3xl transition-transform ${isOpen ? 'rotate-45' : ''} ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>+</span>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 border-t border-slate-200/50">
                    {!dayPlan.workout ? (
                        <div className="p-4 text-center">
                            <span className="text-2xl">🎉</span>
                            <h3 className="text-md font-bold mt-2 text-slate-700">Giorno di Riposo</h3>
                            <p className="text-slate-500 text-sm mt-1">Recupero e relax.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 pt-4">
                            <p className="text-center text-blue-600 font-semibold mb-3">{dayPlan.workout.focus}</p>
                            {dayPlan.workout.exercises.map(exercise => (
                                <ExerciseItem
                                    key={exercise.name}
                                    exercise={exercise}
                                    dayName={dayPlan.dayName}
                                    progress={progress}
                                    updateProgress={updateProgress}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
WorkoutDayAccordion.displayName = 'WorkoutDayAccordion';

const RescueBreathingModal = ({ isOpen, onClose, audioRef }) => {
    const [phase, setPhase] = useState('inspira');
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setCountdown(60);
        setPhase('inspira');

        const countdownTimer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownTimer);
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        let cycleTimers = [];
        const runCycle = () => {
            setPhase('inspira');
            cycleTimers.push(setTimeout(() => {
                setPhase('attendi-top');
                cycleTimers.push(setTimeout(() => {
                    setPhase('espira');
                    cycleTimers.push(setTimeout(() => {
                        setPhase('attendi-bottom');
                        cycleTimers.push(setTimeout(runCycle, 2000));
                    }, 6000));
                }, 2000));
            }, 4000));
        };

        runCycle();

        return () => {
            clearInterval(countdownTimer);
            cycleTimers.forEach(clearTimeout);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getTextForPhase = () => {
        switch (phase) {
            case 'inspira': return 'Inspira...';
            case 'espira': return 'Espira...';
            case 'attendi-top':
            case 'attendi-bottom':
                return 'Attendi';
            default: return '';
        }
    };

    const getAnimationClassForPhase = () => {
        switch (phase) {
            case 'inspira': return 'animate-inhale';
            case 'espira': return 'animate-exhale';
            case 'attendi-top': return 'is-held-top';
            case 'attendi-bottom': return 'is-held-bottom';
            default: return '';
        }
    };

    const formatTime = (seconds) => `0${Math.floor(seconds / 60)}`.slice(-2) + ':' + `0${seconds % 60}`.slice(-2);

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors text-4xl">&times;</button>
            <div className="absolute top-4 text-white/50 font-mono text-2xl">{formatTime(countdown)}</div>

            <div className="flex flex-col items-center justify-center">
                <div
                    className={`relative w-48 h-48 sm:w-64 sm:h-64 bg-blue-500/30 rounded-full flex items-center justify-center transition-transform duration-500 ${getAnimationClassForPhase()}`}
                >
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse-slow"></div>
                </div>
                <p className="text-white text-3xl font-semibold mt-12">{getTextForPhase()}</p>
            </div>
        </div>
    );
};

const MeditationModal = ({ isOpen, onClose, meditation, audioRef }) => {
    if (!isOpen || !meditation) return null;

    const [time, setTime] = useState(meditation.duration * 60);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    const guidingMessages = [
        "Iniziamo. Trova una posizione comoda.", "Chiudi dolcemente gli occhi.", "Porta l'attenzione al tuo respiro, senza cambiarlo.", "Inspira profondamente dal naso...", "...ed espira lentamente dalla bocca.", "Rilassa le spalle, lasciale cadere.", "Distendi i muscoli del viso, della fronte, della mascella.", "Se arrivano dei pensieri, osservali e lasciali andare, come nuvole nel cielo.", "Riporta dolcemente l'attenzione al respiro, ogni volta che la mente si distrae.", "Senti il contatto del tuo corpo con la superficie su cui sei seduto.", "Percepisci l'aria che entra ed esce dalle narici.", "Lascia che un'onda di calma pervada tutto il tuo corpo.", "Sei qui, ora. In questo momento di pace.", "Ancora qualche istante di quiete.", "Lentamente, preparati a tornare.", "Muovi dolcemente le dita delle mani e dei piedi.", "Quando te la senti, apri gli occhi."
    ];

    useEffect(() => {
        if (!isOpen) return;

        setTime(meditation.duration * 60);
        setCurrentMessageIndex(0);

        const timer = setInterval(() => {
            setTime(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const messageTimer = setInterval(() => {
            setCurrentMessageIndex(prev => (prev + 1) % guidingMessages.length);
        }, 15000);

        return () => {
            clearInterval(timer);
            clearInterval(messageTimer);
        };
    }, [isOpen, meditation, onClose, guidingMessages.length]);

    const formatTime = (seconds) => `0${Math.floor(seconds / 60)}`.slice(-2) + ':' + `0${seconds % 60}`.slice(-2);

    const progressPercentage = ((meditation.duration * 60 - time) / (meditation.duration * 60)) * 100;

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex flex-col items-center justify-between p-8 text-white text-center">
            <header className="w-full">
                <h2 className="text-2xl font-bold">{meditation.title}</h2>
                <p className="text-5xl font-mono mt-2">{formatTime(time)}</p>
            </header>

            <main className="flex items-center justify-center">
                <p className="text-3xl font-semibold animate-fade-in-out">{guidingMessages[currentMessageIndex]}</p>
            </main>

            <footer className="w-full max-w-sm">
                <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <button onClick={onClose} className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-semibold transition-colors">
                    Termina Meditazione
                </button>
            </footer>
        </div>
    );
};

const MindfulnessScreen = () => {
    const [activeMeditation, setActiveMeditation] = useState(null);
    const [isMeditationModalOpen, setIsMeditationModalOpen] = useState(false);
    const [isRescueModeActive, setIsRescueModeActive] = useState(false);

    const rescueAudioRef = useRef(null);
    const meditationAudioRef = useRef(null);

    const handlePlayMeditation = (meditation) => {
        setActiveMeditation(meditation);
        setIsMeditationModalOpen(true);
        meditationAudioRef.current?.play().catch(e => console.error("Audio play failed:", e));
    };

    const handleCloseMeditation = () => {
        setIsMeditationModalOpen(false);
        meditationAudioRef.current?.pause();
        if (meditationAudioRef.current) meditationAudioRef.current.currentTime = 0;
    };

    const handleStartRescue = () => {
        setIsRescueModeActive(true);
        rescueAudioRef.current?.play().catch(e => console.error("Audio play failed:", e));
    };

    const handleCloseRescue = () => {
        setIsRescueModeActive(false);
        rescueAudioRef.current?.pause();
        if (rescueAudioRef.current) rescueAudioRef.current.currentTime = 0;
    };

    return (
        <div className="space-y-4">
            <audio ref={rescueAudioRef} src="https://cdn.pixabay.com/download/audio/2022/02/07/audio_c3c3372c32.mp3" preload="auto" loop></audio>
            <audio ref={meditationAudioRef} src="https://cdn.pixabay.com/download/audio/2022/10/14/audio_a29b2cce68.mp3" preload="auto" loop></audio>

            <RescueBreathingModal isOpen={isRescueModeActive} onClose={handleCloseRescue} audioRef={rescueAudioRef} />
            <MeditationModal isOpen={isMeditationModalOpen} onClose={handleCloseMeditation} meditation={activeMeditation} audioRef={meditationAudioRef} />

            <div className="p-4 bg-orange-500/10 backdrop-blur-xl rounded-2xl border border-orange-500/20 shadow-lg shadow-slate-900/5 text-center space-y-3">
                <h2 className="text-lg font-bold text-orange-800">🚨 SOS Fame Nervosa</h2>
                <ul className="text-sm text-slate-600 list-disc list-inside text-left space-y-1">
                    <li>Bevi un grande bicchiere d'acqua.</li>
                    <li>Chiediti: "È fame vera o noia/stress?"</li>
                    <li>Fai una breve passeggiata o cambia stanza.</li>
                </ul>
                <button onClick={handleStartRescue} className="w-full px-4 py-2 rounded-full font-semibold text-white shadow-md transition-colors bg-orange-500/90 hover:bg-orange-500">
                    Avvia 1 Minuto di Respiro
                </button>
            </div>

            {meditations.map(meditation => (
                <div key={meditation.id} className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-slate-800">{meditation.title}</p>
                            <p className="text-xs text-slate-500">{meditation.duration} min - {meditation.category}</p>
                        </div>
                        <button onClick={() => handlePlayMeditation(meditation)} className="w-10 h-10 rounded-full font-semibold bg-blue-500/90 hover:bg-blue-500 text-white shadow-md transition-colors flex items-center justify-center text-2xl flex-shrink-0">
                            ▶
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200/50 italic">"{motivationalQuotes[meditation.id % motivationalQuotes.length]}"</p>
                </div>
            ))}
        </div>
    );
};

const WorkoutScreen = ({ progress, updateProgress, isScrolled, user }) => {
    const [time, setTime] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef(null);
    const todayRef = useRef(null);
    const [weekNumber, setWeekNumber] = useState(1);

    useEffect(() => {
        const start = new Date(user.startDate);
        const today = new Date();
        const diffTime = Math.abs(today - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setWeekNumber(Math.ceil(diffDays / 7));
    }, [user.startDate]);

    useEffect(() => {
        if (todayRef.current) {
            const timer = setTimeout(() => {
                todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
        } else if (!isActive && time !== 0) {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, time]);

    const formatTime = (seconds) => `0${Math.floor(seconds / 60)}`.slice(-2) + ':' + `0${seconds % 60}`.slice(-2);

    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1));

    const daysToShow = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(d.getDate() + i);
        return d;
    });

    return (
        <div className="space-y-6">
            <div className={`fixed top-20 left-0 right-0 z-30 flex justify-center pointer-events-none transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-full max-w-lg px-4 pointer-events-auto">
                    <div className="p-2 bg-white/80 backdrop-blur-xl rounded-full border border-white/30 shadow-lg shadow-slate-900/10 flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0 pl-2">
                            <span className="text-xl">⏱️</span>
                            <p className="text-xl font-mono font-bold text-slate-800 ml-2">{formatTime(time)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setIsActive(!isActive)} className={`w-8 h-8 rounded-full font-semibold text-white shadow-md transition-colors flex items-center justify-center text-sm ${isActive ? 'bg-orange-500/90 hover:bg-orange-500' : 'bg-green-500/90 hover:bg-green-500'}`}>
                                {isActive ? '❚❚' : '▶'}
                            </button>
                            <button onClick={() => { setTime(0); setIsActive(false); }} className="w-8 h-8 rounded-full font-semibold bg-red-500/90 hover:bg-red-500 text-white shadow-md transition-colors flex items-center justify-center text-sm">
                                ■
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`transition-opacity duration-300 ${isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5 text-center">
                    <h3 className="font-bold text-slate-700 mb-2">Timer di Recupero</h3>
                    <p className="text-5xl font-mono font-bold text-slate-800 mb-3">{formatTime(time)}</p>
                    <div className="flex justify-center space-x-3">
                        <button onClick={() => setIsActive(!isActive)} className={`px-4 py-2 rounded-full font-semibold text-white shadow-md transition-colors ${isActive ? 'bg-orange-500/90 hover:bg-orange-500' : 'bg-green-500/90 hover:bg-green-500'}`}>
                            {isActive ? 'Pausa' : 'Avvia'}
                        </button>
                        <button onClick={() => { setTime(0); setIsActive(false); }} className="px-4 py-2 rounded-full font-semibold bg-red-500/90 hover:bg-red-500 text-white shadow-md transition-colors">
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {daysToShow.map((date, idx) => {
                    const isToday = date.toDateString() === today.toDateString();
                    return (
                        <WorkoutDayAccordion
                            key={idx}
                            date={date}
                            isToday={isToday}
                            weekNumber={weekNumber}
                            progress={progress}
                            updateProgress={updateProgress}
                            user={user}
                            ref={isToday ? todayRef : null}
                        />
                    );
                })}
            </div>
        </div>
    );
};

const ShoppingListScreen = ({ user }) => {
    const [personCount, setPersonCount] = useState(1);
    const [generatedList, setGeneratedList] = usePersistentState('progetto80_generated_list', null, user);
    const [checkedItems, setCheckedItems] = usePersistentState('progetto80_shopping_list_checked', {}, user);

    const handleGenerate = () => {
        const list = generateShoppingList(personCount, user);
        setGeneratedList(list);
        setCheckedItems({});
    };

    const handleCheckItem = (itemKey) => {
        setCheckedItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }));
    };

    const handleReset = () => {
        setGeneratedList(null);
        setCheckedItems({});
        localStorage.removeItem(`progetto80_generated_list_${user.name}`);
        localStorage.removeItem(`progetto80_shopping_list_checked_${user.name}`);
    };

    if (!generatedList) {
        return (
            <div className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5 text-center space-y-4">
                <h2 className="text-lg font-bold text-slate-700">Genera Lista della Spesa</h2>
                <p className="text-sm text-slate-500">Seleziona per quante persone vuoi generare la lista della spesa settimanale.</p>
                <div className="flex justify-center items-center gap-4">
                    <button onClick={() => setPersonCount(p => Math.max(1, p - 1))} className="w-10 h-10 rounded-full font-bold text-xl bg-slate-200 text-slate-700">-</button>
                    <span className="text-2xl font-bold text-slate-800">{personCount}</span>
                    <button onClick={() => setPersonCount(p => p + 1)} className="w-10 h-10 rounded-full font-bold text-xl bg-slate-200 text-slate-700">+</button>
                </div>
                <button onClick={handleGenerate} className="w-full px-4 py-3 rounded-full font-semibold text-white shadow-md transition-colors bg-blue-500/90 hover:bg-blue-500">
                    Genera Lista
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-700">Lista per {personCount} {personCount > 1 ? 'persone' : 'persona'}</h2>
                    <button onClick={handleReset} className="text-sm text-blue-600 font-semibold">Nuova Lista</button>
                </div>
            </div>
            {Object.keys(generatedList).sort().map(category => (
                <div key={category} className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5 space-y-3">
                    <h3 className="font-bold text-slate-800">{category}</h3>
                    {generatedList[category].map(item => {
                        const itemKey = `${item.name}-${item.unit}`;
                        return (
                            <div key={itemKey} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={itemKey}
                                    checked={!!checkedItems[itemKey]}
                                    onChange={() => handleCheckItem(itemKey)}
                                    className="h-5 w-5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                                />
                                <label htmlFor={itemKey} className={`ml-3 text-sm text-slate-700 ${checkedItems[itemKey] ? 'line-through text-slate-400' : ''}`}>
                                    {item.quantity}{item.unit} {item.name}
                                </label>
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    );
};

const UserSelectionScreen = ({ onSelectUser }) => {
    return (
        <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Benvenuto in Progetto 80</h1>
            <p className="text-slate-600 mb-8">Seleziona il tuo profilo per iniziare</p>
            <div className="space-y-4 w-full max-w-xs">
                {Object.keys(USERS).map(userName => (
                    <button
                        key={userName}
                        onClick={() => onSelectUser(userName)}
                        className="w-full text-center p-4 bg-white rounded-2xl shadow-lg border border-white/30 font-bold text-lg text-slate-700 hover:bg-blue-500 hover:text-white hover:scale-105 transition-all duration-300"
                    >
                        {userName}
                    </button>
                ))}
            </div>
        </div>
    );
};

const AppContent = ({ user, onUpdateUser, onSwitchUser }) => {
    const [activeTab, setActiveTab] = useState('oggi');
    const [progress, updateProgress] = useDailyProgress('progetto80_progress', user);
    const [fastingDays, setFastingDays] = usePersistentState('progetto80_fasting_days', {}, user);
    const [fastingState, setFastingState] = usePersistentState(
        'progetto80_fasting_state',
        { startTime: null, isActive: false },
        user
    );
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const TabButton = ({ title, icon, active, onPress }) => (
        <button onClick={onPress} className={`flex-1 py-3 flex flex-col items-center justify-center transition-all duration-300 relative ${active ? 'text-slate-900' : 'text-slate-500'}`}>
            {active && <div className="absolute top-0 h-1 w-12 bg-slate-900 rounded-b-full"></div>}
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-bold mt-1 uppercase tracking-wider">{title}</span>
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'oggi': return <OggiScreen 
                user={user}
                progress={progress}
                updateProgress={updateProgress}
                fastingDays={fastingDays}
                fastingState={fastingState}
                isScrolled={isScrolled}
                />;
            case 'plan': return <PlanScreen 
                progress={progress} 
                updateProgress={updateProgress} 
                isScrolled={isScrolled} 
                user={user} 
                fastingDays={fastingDays}
                setFastingDays={setFastingDays}
                fastingState={fastingState}
                setFastingState={setFastingState}
                />;
            case 'progresso': return <ProgressoScreen user={user} onUpdateUser={onUpdateUser} />;
            case 'workout': return <WorkoutScreen progress={progress} updateProgress={updateProgress} isScrolled={isScrolled} user={user} />;
            case 'mindfulness': return <MindfulnessScreen />;
            case 'spesa': return <ShoppingListScreen user={user} />;
            default: return null;
        }
    };

    return (
        <>
            <div className="relative z-10 container mx-auto max-w-lg p-4 pb-24">
                <Header user={user} onSwitchUser={onSwitchUser} />
                <main>{renderContent()}</main>
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-xl flex max-w-lg mx-auto rounded-t-2xl overflow-hidden border-t border-white/30 z-50">
                <TabButton title="Oggi" icon="📊" active={activeTab === 'oggi'} onPress={() => setActiveTab('oggi')} />
                <TabButton title="Piano" icon="📅" active={activeTab === 'plan'} onPress={() => setActiveTab('plan')} />
                <TabButton title="Progresso" icon="⚖️" active={activeTab === 'progresso'} onPress={() => setActiveTab('progresso')} />
                <TabButton title="Workout" icon="🏋️‍♂️" active={activeTab === 'workout'} onPress={() => setActiveTab('workout')} />
                <TabButton title="Mente" icon="🧘" active={activeTab === 'mindfulness'} onPress={() => setActiveTab('mindfulness')} />
                <TabButton title="Spesa" icon="🛒" active={activeTab === 'spesa'} onPress={() => setActiveTab('spesa')} />
            </div>
        </>
    );
}

// --- MAIN APP COMPONENT ---
export default function App() {
    const [currentUser, setCurrentUser] = usePersistentState('progetto80_userData', null);

    const handleSelectUser = (userName) => {
        // When a new user is selected, if they don't have stored data, use the default.
        if (!currentUser || currentUser.name !== userName) {
            setCurrentUser(USERS[userName]);
        }
    };

    const handleSwitchUser = () => {
        setCurrentUser(null);
    };

    const GlobalStyles = () => (
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; }
            @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
            @keyframes inhale { from { transform: scale(0.4); } to { transform: scale(1); } }
            @keyframes exhale { from { transform: scale(1); } to { transform: scale(0.4); } }
            @keyframes pulse-slow { 0% { opacity: 0.7; transform: scale(0.98); } 50% { opacity: 1; transform: scale(1.02); } 100% { opacity: 0.7; transform: scale(0.98); } }
            .animate-inhale { animation: inhale 4s ease-out forwards; }
            .animate-exhale { animation: exhale 6s ease-in-out forwards; }
            .is-held-top { transform: scale(1); }
            .is-held-bottom { transform: scale(0.4); }
            .animate-pulse-slow { animation: pulse-slow 5s infinite cubic-bezier(0.4, 0, 0.6, 1); }
            @keyframes fade-in-out { 0% { opacity: 0; transform: translateY(10px); } 10% { opacity: 1; transform: translateY(0); } 90% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-10px); } }
            .animate-fade-in-out { animation: fade-in-out 15s infinite ease-in-out; }
        `}</style>
    );

    return (
        <div className="bg-slate-100 min-h-screen font-sans relative overflow-x-hidden">
            <GlobalStyles />
            <div className="absolute top-0 -left-48 w-96 h-96 bg-blue-300/50 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-[blob_7s_infinite]"></div>
            <div className="absolute bottom-0 -right-48 w-96 h-96 bg-purple-300/50 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-[blob_7s_infinite_4s]"></div>

            {!currentUser ? (
                <UserSelectionScreen onSelectUser={handleSelectUser} />
            ) : (
                <AppContent user={currentUser} onUpdateUser={setCurrentUser} onSwitchUser={handleSwitchUser} />
            )}
        </div>
    );
}
