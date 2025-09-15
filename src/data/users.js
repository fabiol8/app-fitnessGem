// User configurations that can be used as defaults or presets
// This data should be migrated to Firestore for new users

export const LEGACY_USERS = {
  Fabio: {
    id: 'fabio',
    name: "Fabio",
    startDate: "2025-09-08",
    endDate: "2027-03-08",
    startWeight: 127,
    goalWeight: 80,
    intermediateGoalWeight: 100,
    durationWeeks: 78,
    height: 180,
    gender: 'male',
    age: 35, // Add age for BMR calculations
    activityLevel: 'moderate',
    startMeasurements: {
      weight: 127,
      bodyFat: 40,
      chest: 130,
      waist: 140,
      hips: 135,
      arms: 45,
      neck: 48
    },
    goalMeasurements: {
      weight: 80,
      bodyFat: 18,
      chest: 105,
      waist: 95,
      hips: 100,
      arms: 38,
      neck: 40
    },
    preferences: {
      units: 'metric',
      language: 'it',
      theme: 'light',
      notifications: true,
      privacy: 'private'
    },
    isLegacyUser: true
  },
  Iarno: {
    id: 'iarno',
    name: "Iarno",
    startDate: "2025-09-01",
    endDate: "2026-06-01",
    startWeight: 95,
    goalWeight: 85,
    intermediateGoalWeight: 90,
    durationWeeks: 40,
    height: 185,
    gender: 'male',
    age: 32,
    activityLevel: 'active',
    startMeasurements: {
      weight: 95,
      bodyFat: 22,
      chest: 110,
      waist: 100,
      hips: 105,
      arms: 40,
      neck: 42
    },
    goalMeasurements: {
      weight: 85,
      bodyFat: 15,
      chest: 115,
      waist: 88,
      hips: 100,
      arms: 42,
      neck: 41
    },
    preferences: {
      units: 'metric',
      language: 'it',
      theme: 'light',
      notifications: true,
      privacy: 'private'
    },
    isLegacyUser: true
  }
};

// Default user template for new registrations
export const DEFAULT_USER_TEMPLATE = {
  id: '',
  name: '',
  email: '',
  startDate: '',
  endDate: '',
  startWeight: 0,
  goalWeight: 0,
  intermediateGoalWeight: 0,
  height: 0,
  gender: '',
  age: 0,
  activityLevel: 'moderate',
  startMeasurements: {
    weight: 0,
    bodyFat: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    arms: 0,
    neck: 0
  },
  goalMeasurements: {
    weight: 0,
    bodyFat: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    arms: 0,
    neck: 0
  },
  preferences: {
    units: 'metric',
    language: 'it',
    theme: 'light',
    notifications: true,
    privacy: 'private'
  },
  isLegacyUser: false,
  createdAt: null,
  updatedAt: null
};

// Activity level definitions
export const ACTIVITY_LEVELS = {
  sedentary: {
    id: 'sedentary',
    label: 'Sedentario',
    description: 'Poco o nessun esercizio',
    multiplier: 1.2
  },
  light: {
    id: 'light',
    label: 'Leggero',
    description: 'Esercizio leggero 1-3 giorni/settimana',
    multiplier: 1.375
  },
  moderate: {
    id: 'moderate',
    label: 'Moderato',
    description: 'Esercizio moderato 3-5 giorni/settimana',
    multiplier: 1.55
  },
  active: {
    id: 'active',
    label: 'Attivo',
    description: 'Esercizio intenso 6-7 giorni/settimana',
    multiplier: 1.725
  },
  veryActive: {
    id: 'veryActive',
    label: 'Molto Attivo',
    description: 'Esercizio molto intenso o lavoro fisico',
    multiplier: 1.9
  }
};

// Goal types
export const GOAL_TYPES = {
  weightLoss: {
    id: 'weightLoss',
    label: 'Perdita Peso',
    description: 'Ridurre il peso corporeo',
    icon: '📉'
  },
  weightGain: {
    id: 'weightGain',
    label: 'Aumento Peso',
    description: 'Aumentare il peso corporeo',
    icon: '📈'
  },
  maintenance: {
    id: 'maintenance',
    label: 'Mantenimento',
    description: 'Mantenere il peso attuale',
    icon: '⚖️'
  },
  bodyRecomposition: {
    id: 'bodyRecomposition',
    label: 'Ricomposizione Corporea',
    description: 'Aumentare muscoli, ridurre grasso',
    icon: '💪'
  }
};

export default {
  LEGACY_USERS,
  DEFAULT_USER_TEMPLATE,
  ACTIVITY_LEVELS,
  GOAL_TYPES
};