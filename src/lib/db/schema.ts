import Dexie, { Table } from 'dexie';
import { Food, Meal, DailyLog, UserProfile } from '@/types/db';

export class OpenMacrosDB extends Dexie {
  foods!: Table<Food>;
  meals!: Table<Meal>;
  dailyLogs!: Table<DailyLog>;
  userProfile!: Table<UserProfile>;

  constructor() {
    super('OpenMacrosDB');

    this.version(1).stores({
      foods: 'id, deviceId, createdAt, updatedAt',
      meals: 'id, deviceId, createdAt, updatedAt',
      dailyLogs: 'id, date, deviceId, createdAt, updatedAt',
      userProfile: 'id, deviceId, createdAt, updatedAt',
    });
  }
}

export const db = new OpenMacrosDB();
