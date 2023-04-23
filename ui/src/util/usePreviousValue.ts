import { useEffect, useRef } from "react";

/**
 * Get a value from the previous render. Each render, this will store the
 * passed value, then return the passed value from the last call (i.e. the
 * previous render).
 * @param value Value to track the history of
 * @returns Passed value from the previous render
 */
function usePreviousValue<T>(value: T): T {
  const ref = useRef(value);
  // This useEffect is important. If we try to update the value inline, it
  // gets all fucky (I don't understand it enough to explain)
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default usePreviousValue;
