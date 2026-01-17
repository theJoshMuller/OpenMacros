export interface TDEEInput {
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female';
  activityLevel: number;
  goal: 'lose' | 'maintain' | 'gain';
}

export interface TDEEResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export function calculateBMR(input: TDEEInput): number {
  const { age, weight, height, gender } = input;

  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

export function calculateTDEEFromBMR(bmr: number, activityLevel: number): number {
  return Math.round(bmr * activityLevel);
}

export function calculateGoalCalories(tdee: number, goal: TDEEInput['goal']): number {
  const multipliers = {
    lose: -500,
    maintain: 0,
    gain: 500,
  };

  return Math.round(tdee + multipliers[goal]);
}

export function calculateMacroTargets(
  calories: number,
  goal: TDEEInput['goal'],
  weight: number
): { protein: number; carbs: number; fat: number } {
  const proteinPerKg = goal === 'gain' ? 2.2 : 1.8;

  const protein = Math.round(proteinPerKg * weight);
  const fat = Math.round((calories * 0.3) / 9);
  const remainingCalories = calories - protein * 4 - fat * 9;
  const carbs = Math.round(remainingCalories / 4);

  return {
    protein,
    carbs,
    fat,
  };
}

export function calculateTDEE(input: TDEEInput): TDEEResult {
  const bmr = calculateBMR(input);
  const tdee = calculateTDEEFromBMR(bmr, input.activityLevel);
  const targetCalories = calculateGoalCalories(tdee, input.goal);
  const macros = calculateMacroTargets(targetCalories, input.goal, input.weight);

  return {
    bmr,
    tdee,
    targetCalories,
    targetProtein: macros.protein,
    targetCarbs: macros.carbs,
    targetFat: macros.fat,
  };
}
