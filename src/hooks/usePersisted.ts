"use client";
import { useCallback, useEffect, useState } from "react";

export function usePersistedNumber(key: string, initial: number): [number, (v: number) => void] {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const n = Number(raw);
        if (Number.isFinite(n)) setValue(n);
      }
    } catch (e) {
      console.warn("usePersistedNumber read failed", e);
    }
  }, [key]);
  const set = useCallback((v: number) => {
    setValue(v);
    try {
      localStorage.setItem(key, String(v));
    } catch (e) {
      console.warn("usePersistedNumber write failed", e);
    }
  }, [key]);
  return [value, set];
}
