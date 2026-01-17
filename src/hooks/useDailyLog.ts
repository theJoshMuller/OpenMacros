import { useState, useCallback } from 'react';
import { db } from '@/lib/db/schema';
import { DailyLog, DailyLogEntry } from '@/types/db';
import { generateUUID, generateDeviceId } from '@/lib/utils/uuid';
import { sumNutrition, NutritionValues } from '@/lib/utils/nutrition';

interface UseDailyLogReturn {
  createDailyLog: (date: string) => Promise<DailyLog>;
  getDailyLog: (date: string) => Promise<DailyLog | undefined>;
  addEntry: (
    date: string,
    entry: Omit<DailyLogEntry, 'timestamp'>
  ) => Promise<DailyLog>;
  removeEntry: (date: string, entryIndex: number) => Promise<DailyLog>;
  updateDailyLog: (date: string, data: Partial<DailyLog>) => Promise<DailyLog>;
  deleteDailyLog: (date: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

function calculateTotals(entries: DailyLogEntry[]): {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
} {
  if (entries.length === 0) {
    return {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    };
  }

  const nutritionItems: NutritionValues[] = entries.map((entry) => ({
    calories: entry.calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fat: entry.fat,
  }));

  const summed = sumNutrition(nutritionItems);

  return {
    totalCalories: summed.calories,
    totalProtein: summed.protein,
    totalCarbs: summed.carbs,
    totalFat: summed.fat,
  };
}

function createEntryWithTimestamp(
  entry: Omit<DailyLogEntry, 'timestamp'>
): DailyLogEntry {
  return {
    ...entry,
    timestamp: Date.now(),
  };
}

export function useDailyLog(): UseDailyLogReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createDailyLog = useCallback(async (date: string): Promise<DailyLog> => {
    setLoading(true);
    setError(null);

    try {
      const now = Date.now();
      const deviceId = generateDeviceId();
      const id = generateUUID();

      const dailyLog: DailyLog = {
        id,
        date,
        entries: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        deviceId,
        createdAt: now,
        updatedAt: now,
      };

      await db.dailyLogs.add(dailyLog);
      return dailyLog;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to create daily log');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDailyLog = useCallback(
    async (date: string): Promise<DailyLog | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const log = await db.dailyLogs.where('date').equals(date).first();
        return log;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to get daily log');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addEntry = useCallback(
    async (
      date: string,
      entry: Omit<DailyLogEntry, 'timestamp'>
    ): Promise<DailyLog> => {
      setLoading(true);
      setError(null);

      try {
        let log = await db.dailyLogs.where('date').equals(date).first();

        if (!log) {
          log = await createDailyLog(date);
        }

        const newEntry = createEntryWithTimestamp(entry);
        const updatedEntries = [...log.entries, newEntry];

        const totals = calculateTotals(updatedEntries);

        await db.dailyLogs.update(log.id, {
          entries: updatedEntries,
          ...totals,
          updatedAt: Date.now(),
        });

        const updatedLog: DailyLog = {
          ...log,
          entries: updatedEntries,
          ...totals,
          updatedAt: Date.now(),
        };

        return updatedLog;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to add entry');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [createDailyLog]
  );

  const removeEntry = useCallback(
    async (date: string, entryIndex: number): Promise<DailyLog> => {
      setLoading(true);
      setError(null);

      try {
        const log = await db.dailyLogs.where('date').equals(date).first();

        if (!log) {
          throw new Error(`Daily log for date ${date} not found`);
        }

        if (entryIndex < 0 || entryIndex >= log.entries.length) {
          throw new Error(`Invalid entry index: ${entryIndex}`);
        }

        const updatedEntries = log.entries.filter((_, i) => i !== entryIndex);

        const totals = calculateTotals(updatedEntries);

        await db.dailyLogs.update(log.id, {
          entries: updatedEntries,
          ...totals,
          updatedAt: Date.now(),
        });

        const updatedLog: DailyLog = {
          ...log,
          entries: updatedEntries,
          ...totals,
          updatedAt: Date.now(),
        };

        return updatedLog;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to remove entry');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateDailyLog = useCallback(
    async (date: string, data: Partial<DailyLog>): Promise<DailyLog> => {
      setLoading(true);
      setError(null);

      try {
        const log = await db.dailyLogs.where('date').equals(date).first();

        if (!log) {
          throw new Error(`Daily log for date ${date} not found`);
        }

        const updateData = {
          ...data,
          updatedAt: Date.now(),
        } as Partial<DailyLog>;

        await db.dailyLogs.update(log.id, updateData);

        const updatedLog: DailyLog = {
          ...log,
          ...data,
          updatedAt: Date.now(),
        };

        return updatedLog;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to update daily log');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteDailyLog = useCallback(async (date: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const log = await db.dailyLogs.where('date').equals(date).first();

      if (!log) {
        throw new Error(`Daily log for date ${date} not found`);
      }

      await db.dailyLogs.delete(log.id);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to delete daily log');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createDailyLog,
    getDailyLog,
    addEntry,
    removeEntry,
    updateDailyLog,
    deleteDailyLog,
    loading,
    error,
  };
}
