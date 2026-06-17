import { useState, useCallback } from 'react';

type Reviver = (key: string, value: unknown) => unknown;

function readFromStorage<T>(key: string, initialValue: T, reviver?: Reviver): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return initialValue;
    return JSON.parse(item, reviver as Parameters<typeof JSON.parse>[1]) as T;
  } catch {
    return initialValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  reviver?: Reviver,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readFromStorage(key, initialValue, reviver),
  );

  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (action) => {
      setStoredValue((prev) => {
        const next = typeof action === 'function'
          ? (action as (prev: T) => T)(prev)
          : action;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // 용량 초과 등 localStorage 쓰기 실패는 무시
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
