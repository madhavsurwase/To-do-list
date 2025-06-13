
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
    // This effect ensures that if the `key` prop changes, the state is updated
    // from localStorage for the new key, or reset to initialValue (from the effect's closure)
    // if the new key isn't in localStorage.
    // The useState initializer handles the very first load.
    if (typeof window === "undefined") {
      return;
    }

    let valueToSet;
    let writeToLocalStorage = false;

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        valueToSet = JSON.parse(item);
      } else {
        valueToSet = initialValue; // Use initialValue from the closure if key not found
        writeToLocalStorage = true; 
      }
    } catch (error) {
      console.error("Error reading/parsing localStorage key “" + key + "” in useEffect:", error);
      valueToSet = initialValue; // Fallback to initialValue from closure
      writeToLocalStorage = true;
    }

    setStoredValue(valueToSet);

    if (writeToLocalStorage) {
      try {
        // Persist the initialValue (or fallback value) to localStorage if it wasn't there for the current key
        window.localStorage.setItem(key, JSON.stringify(valueToSet));
      } catch (error) {
        console.error("Error writing to localStorage key “" + key + "” in useEffect:", error);
      }
    }
  }, [key]); // Only depend on `key`. `initialValue` from closure will be used.


  return [storedValue, setValue];
}

export default useLocalStorage;
