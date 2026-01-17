import { useState, useCallback, useEffect } from 'react';
import { db } from '@/lib/db/schema';
import { Food } from '@/types/db';
import { generateUUID, generateDeviceId } from '@/lib/utils/uuid';

interface UseFoodsReturn {
  createFood: (
    data: Omit<Food, 'id' | 'deviceId' | 'createdAt' | 'updatedAt'>
  ) => Promise<Food>;
  searchFoods: (query: string) => Promise<Food[]>;
  getAllFoods: () => Promise<Food[]>;
  updateFood: (id: string, data: Partial<Food>) => Promise<Food>;
  deleteFood: (id: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

const seedFoodsData: Array<
  Omit<Food, 'id' | 'deviceId' | 'createdAt' | 'updatedAt'>
> = [
  {
    name: { en: 'Banana', es: 'Plátano' },
    description: {
      en: 'Fresh yellow banana',
      es: 'Plátano fresco amarillo',
    },
    servingSize: 1,
    servingUnit: { en: 'medium', es: 'mediano' },
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    fiber: 3.1,
    sugar: 14,
  },
  {
    name: { en: 'Chicken Breast', es: 'Pechuga de Pollo' },
    description: {
      en: 'Skinless, boneless chicken breast',
      es: 'Pechuga de pollo sin piel y sin hueso',
    },
    servingSize: 100,
    servingUnit: { en: 'grams', es: 'gramos' },
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
  },
  {
    name: { en: 'White Rice', es: 'Arroz Blanco' },
    description: {
      en: 'Cooked white rice',
      es: 'Arroz blanco cocido',
    },
    servingSize: 100,
    servingUnit: { en: 'grams', es: 'gramos' },
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
  },
  {
    name: { en: 'Apple', es: 'Manzana' },
    description: {
      en: 'Medium apple with skin',
      es: 'Manzana mediana con cáscara',
    },
    servingSize: 1,
    servingUnit: { en: 'medium', es: 'mediana' },
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    fiber: 4.4,
    sugar: 19,
  },
  {
    name: { en: 'Egg', es: 'Huevo' },
    description: {
      en: 'Large egg',
      es: 'Huevo grande',
    },
    servingSize: 1,
    servingUnit: { en: 'large', es: 'grande' },
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fat: 5,
  },
  {
    name: { en: 'Greek Yogurt', es: 'Yogur Griego' },
    description: {
      en: 'Non-fat Greek yogurt',
      es: 'Yogur griego sin grasa',
    },
    servingSize: 170,
    servingUnit: { en: 'grams', es: 'gramos' },
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0.7,
  },
  {
    name: { en: 'Oatmeal', es: 'Avena' },
    description: {
      en: 'Cooked oatmeal',
      es: 'Avena cocida',
    },
    servingSize: 100,
    servingUnit: { en: 'grams', es: 'gramos' },
    calories: 68,
    protein: 2.4,
    carbs: 12,
    fat: 1.4,
    fiber: 1.7,
  },
  {
    name: { en: 'Salmon', es: 'Salmón' },
    description: {
      en: 'Atlantic salmon fillet',
      es: 'Filete de salmón atlántico',
    },
    servingSize: 100,
    servingUnit: { en: 'grams', es: 'gramos' },
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
  },
  {
    name: { en: 'Broccoli', es: 'Brócoli' },
    description: {
      en: 'Steamed broccoli',
      es: 'Brócoli al vapor',
    },
    servingSize: 100,
    servingUnit: { en: 'grams', es: 'gramos' },
    calories: 35,
    protein: 2.4,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
  },
  {
    name: { en: 'Almonds', es: 'Almendras' },
    description: {
      en: 'Raw almonds',
      es: 'Almendras crudas',
    },
    servingSize: 28,
    servingUnit: { en: 'grams', es: 'gramos' },
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    fiber: 3.5,
  },
  {
    name: { en: 'Avocado', es: 'Aguacate' },
    description: {
      en: 'Fresh avocado',
      es: 'Aguacate fresco',
    },
    servingSize: 1,
    servingUnit: { en: 'medium', es: 'mediano' },
    calories: 234,
    protein: 2.9,
    carbs: 12,
    fat: 21,
    fiber: 10,
  },
  {
    name: { en: 'Sweet Potato', es: 'Batata' },
    description: {
      en: 'Baked sweet potato',
      es: 'Batata horneada',
    },
    servingSize: 1,
    servingUnit: { en: 'medium', es: 'mediana' },
    calories: 103,
    protein: 2,
    carbs: 24,
    fat: 0.2,
    fiber: 3.8,
    sugar: 7,
  },
  {
    name: { en: 'Tuna', es: 'Atún' },
    description: {
      en: 'Canned tuna in water',
      es: 'Atún en lata en agua',
    },
    servingSize: 100,
    servingUnit: { en: 'grams', es: 'gramos' },
    calories: 116,
    protein: 26,
    carbs: 0,
    fat: 0.8,
  },
  {
    name: { en: 'Pasta', es: 'Pasta' },
    description: {
      en: 'Cooked spaghetti',
      es: 'Espaguetis cocidos',
    },
    servingSize: 100,
    servingUnit: { en: 'grams', es: 'gramos' },
    calories: 131,
    protein: 5,
    carbs: 25,
    fat: 1.1,
  },
  {
    name: { en: 'Orange', es: 'Naranja' },
    description: {
      en: 'Medium orange',
      es: 'Naranja mediana',
    },
    servingSize: 1,
    servingUnit: { en: 'medium', es: 'mediana' },
    calories: 62,
    protein: 1.2,
    carbs: 15,
    fat: 0.2,
    fiber: 3.1,
    sugar: 12,
  },
  {
    name: { en: 'Milk', es: 'Leche' },
    description: {
      en: 'Whole milk',
      es: 'Leche entera',
    },
    servingSize: 240,
    servingUnit: { en: 'ml', es: 'ml' },
    calories: 149,
    protein: 7.7,
    carbs: 12,
    fat: 8,
  },
  {
    name: { en: 'Cheese', es: 'Queso' },
    description: {
      en: 'Cheddar cheese',
      es: 'Queso cheddar',
    },
    servingSize: 28,
    servingUnit: { en: 'grams', es: 'gramos' },
    calories: 113,
    protein: 7,
    carbs: 0.4,
    fat: 9,
  },
  {
    name: { en: 'Spinach', es: 'Espinacas' },
    description: {
      en: 'Fresh spinach',
      es: 'Espinacas frescas',
    },
    servingSize: 100,
    servingUnit: { en: 'grams', es: 'gramos' },
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
  },
  {
    name: { en: 'Ground Beef', es: 'Carne Molida' },
    description: {
      en: '90% lean ground beef',
      es: 'Carne molida 90% magra',
    },
    servingSize: 100,
    servingUnit: { en: 'grams', es: 'gramos' },
    calories: 250,
    protein: 26,
    carbs: 0,
    fat: 15,
  },
];

async function seedFoods(): Promise<void> {
  const count = await db.foods.count();
  
  if (count === 0) {
    const now = Date.now();
    const deviceId = generateDeviceId();
    
    const foods: Food[] = seedFoodsData.map((food) => ({
      ...food,
      id: generateUUID(),
      deviceId,
      createdAt: now,
      updatedAt: now,
    }));
    
    await db.foods.bulkAdd(foods);
  }
}

export function useFoods(): UseFoodsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    seedFoods().catch((err) => {
      console.error('Failed to seed foods:', err);
    });
  }, []);

  const createFood = useCallback(
    async (
      data: Omit<Food, 'id' | 'deviceId' | 'createdAt' | 'updatedAt'>
    ): Promise<Food> => {
      setLoading(true);
      setError(null);

      try {
        const now = Date.now();
        const deviceId = generateDeviceId();
        const id = generateUUID();

        const food: Food = {
          ...data,
          id,
          deviceId,
          createdAt: now,
          updatedAt: now,
        };

        await db.foods.add(food);
        return food;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to create food');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const searchFoods = useCallback(async (query: string): Promise<Food[]> => {
    setLoading(true);
    setError(null);

    try {
      const allFoods = await db.foods.toArray();
      const lowerQuery = query.toLowerCase();

      const filtered = allFoods.filter(
        (food) =>
          food.name.en.toLowerCase().includes(lowerQuery) ||
          food.name.es.toLowerCase().includes(lowerQuery) ||
          food.description.en.toLowerCase().includes(lowerQuery) ||
          food.description.es.toLowerCase().includes(lowerQuery) ||
          (food.brand && food.brand.toLowerCase().includes(lowerQuery))
      );

      return filtered;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to search foods');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllFoods = useCallback(async (): Promise<Food[]> => {
    setLoading(true);
    setError(null);

    try {
      const foods = await db.foods.toArray();
      return foods;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to get all foods');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFood = useCallback(
    async (id: string, data: Partial<Food>): Promise<Food> => {
      setLoading(true);
      setError(null);

      try {
        const existingFood = await db.foods.get(id);

        if (!existingFood) {
          throw new Error(`Food with id ${id} not found`);
        }

        const updatedFood: Food = {
          ...existingFood,
          ...data,
          id,
          updatedAt: Date.now(),
        };

        await db.foods.update(id, updatedFood);
        return updatedFood;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to update food');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteFood = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await db.foods.delete(id);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to delete food');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createFood,
    searchFoods,
    getAllFoods,
    updateFood,
    deleteFood,
    loading,
    error,
  };
}
