import { useContext, useCallback, useSyncExternalStore } from 'react';
import { SharedStateContext } from './shared-state-context';

import type { StateKey, SharedStateResult, SharedStateSetterValue, SharedStateSetterOnly, StateOptions } from './types';

export const useSharedState = <T>(key: StateKey<T>): SharedStateResult<T> => {
  const api = useContext(SharedStateContext);

  const value = useSyncExternalStore(api.event.subscribe, () => api.get(key));

  const setValue = useCallback(
    (arg: SharedStateSetterValue<T>, options: StateOptions = { notify: true }): void => {
      // @ts-expect-error - assume the type of function is correct
      const value = typeof arg === 'function' ? arg(api.get(key)) : arg;
      api.set(key, value, options);
    },
    [api, key],
  );

  return [value, setValue];
};

export const useSharedStateSendOnly = <T>(key: StateKey<T>): SharedStateSetterOnly<T> => {
  const api = useContext(SharedStateContext);

  const setValue = useCallback(
    (arg: SharedStateSetterValue<T>, options: StateOptions = { notify: true }) => {
      // @ts-expect-error - assume the type of function is correct
      const value = typeof arg === 'function' ? arg(api.get(key)) : arg;
      api.set(key, value, options);
    },
    [api, key],
  );

  return setValue;
};

export const useSharedStateContext = () => {
  return useContext(SharedStateContext);
};
