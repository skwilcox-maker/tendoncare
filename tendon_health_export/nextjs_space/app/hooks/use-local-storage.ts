'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window?.localStorage?.getItem?.(key);
      if (item) {
        const parsed = JSON.parse(item);
        setStoredValue(parsed);
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
    }
    setIsLoaded(true);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev: T) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          window?.localStorage?.setItem?.(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch (error) {
        console.error('Error setting localStorage:', error);
      }
    },
    [key]
  );

  return [storedValue, setValue, isLoaded];
}
