import { DependencyList, useEffect } from "react";

/**
 * A debug hook to log changes to dependencies. Usefully for debugging why a
 * useEffect is running multiple times.
 * @param dependencies List of dependencies, the same as useEffect
 */
function useDebugEffect(name: string, dependencies: DependencyList): void {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`${name} dependencies changed:`, ...dependencies);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

export default useDebugEffect;
