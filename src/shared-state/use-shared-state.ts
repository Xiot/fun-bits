// @flow
import { useContext, useCallback } from 'react';
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

export const useSharedState = <T>(key: StateKey<T>): SharedStateResult<T> => {
  const api = useContext(SharedStateContext);
  const [update] = useForceUpdate();

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
      // $FlowFixMe - Assume the type of function is correct.
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
      // $FlowFixMe - Assume the type of function is correct.
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
