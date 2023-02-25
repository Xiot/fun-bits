import { useCallback, useEffect, useRef, useState } from "react";

export function useBatch<T>(cb: (items: T[]) => void) {

  const ref = useRef(cb);
  ref.current = cb;

  const items = useRef<T[]>([])
  const timer = useRef<number | null>(null);
  const [signal, setSignal] = useState<object>(() => Object.create(null))

  useEffect(() => {
    if (items.current.length === 0) return;

    const local = items.current;
    items.current = [];

    ref.current(local)

  }, [signal])

  const append = useCallback((item: T) => {
    items.current = [...items.current, item];
    if (timer.current) return;
    timer.current = setTimeout(() => {
      timer.current = null;
      setSignal(Object.create(null))
    }, 1);
  }, [])

  return {
    append
  }

}