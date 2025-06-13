"use client";

import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage key “" + key + "”:", error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === "undefined") {
        console.warn(`Tried to set localStorage key “${key}” even though environment is not a client`);
        return;
      }
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error("Error setting localStorage key “" + key + "”:", error);
      }
    },
    [key, storedValue]
  );
  
  useEffect(() => {
    setStoredValue(() => {
        if (typeof window === "undefined") {
          return initialValue;
        }
        try {
          const item = window.localStorage.getItem(key);
          return item ? JSON.parse(item) : initialValue;
        } catch (error) {
          console.error("Error reading localStorage key “" + key + "”:", error);
          return initialValue;
        }
      });
  }, [key, initialValue]);


  return [storedValue, setValue];
}

export default useLocalStorage;
