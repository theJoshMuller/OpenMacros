import { useState, useCallback } from 'react';
import { db } from '@/lib/db/schema';
import { UserProfile } from '@/types/db';
import { generateUUID, generateDeviceId } from '@/lib/utils/uuid';

interface UseUserProfileReturn {
  createUserProfile: (
    data: Omit<UserProfile, 'id' | 'deviceId' | 'createdAt' | 'updatedAt'>
  ) => Promise<UserProfile>;
  getUserProfile: () => Promise<UserProfile | undefined>;
  updateUserProfile: (
    id: string,
    data: Partial<UserProfile>
  ) => Promise<UserProfile>;
  deleteUserProfile: (id: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export function useUserProfile(): UseUserProfileReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createUserProfile = useCallback(
    async (
      data: Omit<UserProfile, 'id' | 'deviceId' | 'createdAt' | 'updatedAt'>
    ): Promise<UserProfile> => {
      setLoading(true);
      setError(null);

      try {
        const now = Date.now();
        const deviceId = generateDeviceId();
        const id = generateUUID();

        const profile: UserProfile = {
          ...data,
          id,
          deviceId,
          createdAt: now,
          updatedAt: now,
        };

        await db.userProfile.add(profile);
        return profile;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to create user profile');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getUserProfile = useCallback(async (): Promise<
    UserProfile | undefined
  > => {
    setLoading(true);
    setError(null);

    try {
      const profile = await db.userProfile.limit(1).first();
      return profile;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to get user profile');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(
    async (
      id: string,
      data: Partial<UserProfile>
    ): Promise<UserProfile> => {
      setLoading(true);
      setError(null);

      try {
        const existingProfile = await db.userProfile.get(id);

        if (!existingProfile) {
          throw new Error(`Profile with id ${id} not found`);
        }

        const updatedProfile: UserProfile = {
          ...existingProfile,
          ...data,
          id,
          updatedAt: Date.now(),
        };

        await db.userProfile.update(id, updatedProfile);
        return updatedProfile;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to update user profile');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteUserProfile = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await db.userProfile.delete(id);
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to delete user profile');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    loading,
    error,
  };
}
