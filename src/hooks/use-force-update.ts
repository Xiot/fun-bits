import { useReducer } from "react";

export function useForceUpdate(): () => void {
  const [, setValue] = useReducer(() => Object.create(null), null);
  return setValue
}