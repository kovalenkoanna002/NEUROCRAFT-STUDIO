import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function usePersistedState<T>(
  key: string | null,
  initial: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (key) {
      try {
        const raw = localStorage.getItem(key);
        if (raw != null) return JSON.parse(raw) as T;
      } catch {

      }
    }
    return typeof initial === "function" ? (initial as () => T)() : initial;
  });

  useEffect(() => {
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {

    }
  }, [key, state]);

  return [state, setState];
}
