import { useEffect, useState } from "react";

// Returns `value`, but only after it has stopped changing for `delay` milliseconds
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer); // value changed again → cancel the old timer
  }, [value, delay]);

  return debouncedValue;
}