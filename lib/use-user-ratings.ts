'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserRating } from '@/types';

const STORAGE_KEY = 'dns_user_ratings';

export function useUserRatings() {
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRatings(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveRating = useCallback((rating: UserRating) => {
    setRatings((prev) => {
      // Replace existing rating for this provider if it exists
      const filtered = prev.filter((r) => r.providerId !== rating.providerId);
      const updated = [...filtered, rating];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore quota errors
      }
      return updated;
    });
  }, []);

  const getUserRating = useCallback(
    (providerId: string) => ratings.find((r) => r.providerId === providerId),
    [ratings]
  );

  return { ratings, isLoaded, saveRating, getUserRating };
}
