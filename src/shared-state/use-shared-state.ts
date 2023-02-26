// @flow
import { useContext, useCallback, useState } from 'react';
import { useForceUpdate } from '../hooks/use-force-update';
import { useEventHandler } from '../hooks/use-events';
import { SharedStateContext } from './shared-state-context';

import type {
  StateKey,
  SharedStateResult,
  SharedStateSetterValue,
  SharedStateSetterOnly,
  StateOptions,
} from './types';

// TODO: Use useSyncExternalStore - https://beta.reactjs.org/reference/react/useSyncExternalStore

export const useSharedState = <T>(key: StateKey<T>): SharedStateResult<T> => {
  const api = useContext(SharedStateContext);
  const update = useForceUpdate();

  useEventHandler(
    api.event,
    (action) => {
      if (action.key === key) {
        update();
      }
    },
    [key]
  );

  const setValue = useCallback(
    (arg: SharedStateSetterValue<T>, options: StateOptions = { notify: true }): void => {
      // @ts-ignore-error - assume the type of function is correct
      const value = typeof arg === 'function' ? arg(api.get(key)) : arg;
      api.set(key, value, options);
    },
    [api, key]
  );

  return [api.get(key), setValue];
};

export const useSharedStateSendOnly = <T>(key: StateKey<T>): SharedStateSetterOnly<T> => {
  const api = useContext(SharedStateContext);

  const setValue = useCallback(
    (arg: SharedStateSetterValue<T>, options: StateOptions = { notify: true }) => {
      // @ts-ignore-error - assume the type of function is correct
      const value = typeof arg === 'function' ? arg(api.get(key)) : arg;
      api.set(key, value, options);
    },
    [api, key]
  );

  return setValue;
};

export const useSharedStateContext = () => {
  return useContext(SharedStateContext);
};
