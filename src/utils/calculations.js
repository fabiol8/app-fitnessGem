/**
 * BMI Calculation and Classification
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return 0;
  }
  return weight / Math.pow(height / 100, 2);
};

export const getBMIStatus = (bmi) => {
  if (bmi < 18.5) {
    return { category: 'Sottopeso', color: 'text-blue-600', bgColor: 'bg-blue-50' };
  } else if (bmi < 25) {
    return { category: 'Normale', color: 'text-green-600', bgColor: 'bg-green-50' };
  } else if (bmi < 30) {
    return { category: 'Sovrappeso', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  } else {
    return { category: 'Obeso', color: 'text-red-600', bgColor: 'bg-red-50' };
  }
};

/**
 * Weight Loss Progress Calculations
 */
export const calculateWeightLossProgress = (startWeight, currentWeight, goalWeight) => {
  if (!startWeight || !goalWeight || startWeight <= goalWeight) {
    return { percentage: 0, lost: 0, remaining: 0 };
  }

  const totalToLose = startWeight - goalWeight;
  const currentLoss = Math.max(0, startWeight - (currentWeight || startWeight));
  const remaining = Math.max(0, (currentWeight || startWeight) - goalWeight);
  const percentage = Math.min(100, (currentLoss / totalToLose) * 100);

  return {
    percentage: Math.round(percentage * 10) / 10,
    lost: Math.round(currentLoss * 10) / 10,
    remaining: Math.round(remaining * 10) / 10,
    total: totalToLose
  };
};

/**
 * Calorie and Macro Calculations
 */
export const calculateBMR = (weight, height, age, gender) => {
  // Mifflin-St Jeor Equation
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

export const calculateTDEE = (bmr, activityLevel) => {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  };

  return bmr * (activityMultipliers[activityLevel] || 1.2);
};

export const calculateMacros = (calories, macroRatio = { protein: 0.3, carbs: 0.4, fats: 0.3 }) => {
  return {
    protein: Math.round((calories * macroRatio.protein) / 4), // 4 cal/g
    carbs: Math.round((calories * macroRatio.carbs) / 4), // 4 cal/g
    fats: Math.round((calories * macroRatio.fats) / 9) // 9 cal/g
  };
};

/**
 * Progress and Timeline Calculations
 */
export const calculateTimelineProgress = (startDate, endDate, currentDate = new Date()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(currentDate);

  const totalDuration = end - start;
  const elapsed = current - start;
  const remaining = end - current;

  const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  return {
    percentage: Math.round(percentage * 10) / 10,
    daysElapsed: Math.floor(elapsed / (1000 * 60 * 60 * 24)),
    daysRemaining: Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24))),
    totalDays: Math.ceil(totalDuration / (1000 * 60 * 60 * 24)),
    isCompleted: percentage >= 100
  };
};

/**
 * Body Measurements Calculations
 */
export const calculateBodyFatPercentage = (gender, waist, neck, height, hip = null) => {
  // US Navy Method
  if (gender === 'male') {
    return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  } else {
    if (!hip) return null;
    return 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
  }
};

export const calculateWaistToHipRatio = (waist, hip) => {
  if (!waist || !hip || hip === 0) return 0;
  return Math.round((waist / hip) * 100) / 100;
};

export const calculateWaistToHeightRatio = (waist, height) => {
  if (!waist || !height || height === 0) return 0;
  return Math.round((waist / height) * 100) / 100;
};

/**
 * Nutrition Calculations
 */
export const calculateMealMacros = (ingredients) => {
  return ingredients.reduce((totals, ingredient) => {
    const { calories = 0, protein = 0, carbs = 0, fats = 0 } = ingredient;
    return {
      calories: totals.calories + calories,
      protein: totals.protein + protein,
      carbs: totals.carbs + carbs,
      fats: totals.fats + fats
    };
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
};

export const calculateDailyMacros = (meals) => {
  return meals.reduce((dailyTotals, meal) => {
    return {
      calories: dailyTotals.calories + (meal.calories || 0),
      protein: dailyTotals.protein + (meal.protein || 0),
      carbs: dailyTotals.carbs + (meal.carbs || 0),
      fats: dailyTotals.fats + (meal.fats || 0)
    };
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
};

/**
 * Workout Calculations
 */
export const calculateCaloriesBurned = (activity, duration, weight) => {
  // MET values for common activities
  const metValues = {
    walking: 3.8,
    running: 9.8,
    cycling: 7.5,
    weightLifting: 6.0,
    swimming: 8.0,
    yoga: 2.5,
    pilates: 3.0,
    hiit: 8.0
  };

  const met = metValues[activity] || 5.0;
  return Math.round((met * weight * duration) / 60);
};

/**
 * Statistical Calculations
 */
export const calculateAverage = (values) => {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + (val || 0), 0);
  return Math.round((sum / values.length) * 100) / 100;
};

export const calculateTrend = (values) => {
  if (!values || values.length < 2) return 0;

  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((acc, val) => acc + (val || 0), 0);
  const sumXY = values.reduce((acc, val, index) => acc + index * (val || 0), 0);
  const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  return Math.round(slope * 1000) / 1000;
};

export default {
  calculateBMI,
  getBMIStatus,
  calculateWeightLossProgress,
  calculateBMR,
  calculateTDEE,
  calculateMacros,
  calculateTimelineProgress,
  calculateBodyFatPercentage,
  calculateWaistToHipRatio,
  calculateWaistToHeightRatio,
  calculateMealMacros,
  calculateDailyMacros,
  calculateCaloriesBurned,
  calculateAverage,
  calculateTrend
};