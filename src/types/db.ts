export interface Food {
  id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  brand?: string;
  servingSize: number;
  servingUnit: { en: string; es: string };
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  deviceId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Meal {
  id: string;
  name: { en: string; es: string };
  foods: Array<{ foodId: string; quantity: number }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  deviceId: string;
  createdAt: number;
  updatedAt: number;
}

export interface DailyLogEntry {
  type: 'food' | 'meal';
  itemId: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
}

export interface DailyLog {
  id: string;
  date: string;
  entries: DailyLogEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  deviceId: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  openRouterApiKey?: string;
  selectedModel?: string;
  modelTag?: string;
  language: 'en' | 'es';
  deviceId: string;
  createdAt: number;
  updatedAt: number;
}

export interface ActivityLevel {
  value: number;
  label: { en: string; es: string };
}

export interface Goal {
  value: 'lose' | 'maintain' | 'gain';
  label: { en: string; es: string };
  multiplier: number;
}
