export interface NutritionValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export function calculateNutrition(base: NutritionValues, quantity: number, baseServing: number): NutritionValues {
  const multiplier = quantity / baseServing;

  return {
    calories: Math.round(base.calories * multiplier),
    protein: Math.round(base.protein * multiplier * 10) / 10,
    carbs: Math.round(base.carbs * multiplier * 10) / 10,
    fat: Math.round(base.fat * multiplier * 10) / 10,
    fiber: base.fiber ? Math.round(base.fiber * multiplier * 10) / 10 : undefined,
    sugar: base.sugar ? Math.round(base.sugar * multiplier * 10) / 10 : undefined,
  };
}

export function sumNutrition(items: NutritionValues[]): NutritionValues {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: Math.round((acc.protein + item.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + item.carbs) * 10) / 10,
      fat: Math.round((acc.fat + item.fat) * 10) / 10,
      fiber: item.fiber !== undefined && acc.fiber !== undefined
        ? Math.round((acc.fiber + item.fiber) * 10) / 10
        : undefined,
      sugar: item.sugar !== undefined && acc.sugar !== undefined
        ? Math.round((acc.sugar + item.sugar) * 10) / 10
        : undefined,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function calculatePercentage(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.round((current / target) * 100);
}
