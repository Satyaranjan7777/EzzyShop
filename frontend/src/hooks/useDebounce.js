import { useState, useEffect } from "react";

/**
 * Custom hook to debounce rapid value changes (e.g. search inputs)
 * @param {any} value
 * @param {number} delay (ms)
 * @returns {any}
 */
export const useDebounce = (value, delay = 450) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
