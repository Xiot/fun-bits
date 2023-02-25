// @flow
import React, { createContext, useMemo } from 'react';

import { type EventSource, useEvent, useEventHandler } from '../../hooks/events';
import type { StateKey, StateOptions } from './types';
import { useBatch } from '../../hooks/use-batch';
import { chain } from '../../utils/enumerable';
import { merge } from 'lodash';

type EventArgs = {
  // flowlint-next-line unclear-type:off
  key: StateKey<any>,
  // flowlint-next-line unclear-type:off
  value: any,
};
// flowlint-next-line unclear-type:off
type MapState = Map<StateKey<any>, any>;

export type SharedStateApi = {
  get<T>(key: StateKey<T>): T,
  set<T>(key: StateKey<T>, value: T, options?: StateOptions): void,
  clear<T>(key: StateKey<T>, options?: StateOptions): void,
  all(): { [symbol]: mixed },
  event: EventSource<EventArgs>,
};
type InternalStateKey<T> = StateKey<T> & { __defaultValue?: T };

const emptySharedState = {};
export const SharedStateContext = createContext<SharedStateApi>(emptySharedState);

type SharedStateProviderProps = {
  children: React$Node,
  initialValues?: MapState,

  mergeState?: SharedStateApi,

  // additionally, if one want to get a handle on the api of their child. use a ref
  // This is useful, when you want to relay/merge down state from say,
  // another shared state, higher up in the tree.
};

type PendingFireEvent = {
  key: StateKey<>,
  // flowlint-next-line unclear-type:off
  value: any,
};

export function SharedStateProvider(props: SharedStateProviderProps) {
  const changedEvent = useEvent();
  const batch = useBatch<PendingFireEvent>((events) => {
    // Batch the events by merging items with the same key
    const batchedEvents = chain(events)
      .groupBy(
        (e) => e.key,
        (e) => e.value
      )
      .map((g) => ({ key: g.key, value: g.values.reduce((acc, e) => merge(acc, e), {}) }))
      .toArray();

    batchedEvents.forEach((event) => changedEvent.fire(event));
  });

  const api = useMemo(() => {
    // flowlint-next-line unclear-type:off
    const state = new Map<StateKey<any>, any>(props.initialValues);

    const toObject: () => { [symbol]: mixed } = () =>
      // $FlowFixMe - null prototype is fine
      Array.from(state.entries()).reduce((obj, [key, value]) => {
        // $FlowFixMe - Symbols are good
        obj[key.key] = value;
        return obj;
      }, Object.create(null));

    return {
      all() {
        return toObject();
      },
      get<T>(key: StateKey<T>): T {
        if (state.has(key)) {
          // $FlowFixMe - it is in the list
          return state.get(key);
        }
        // $FlowFixMe - its on them
        return (key: InternalStateKey<T>).__defaultValue;
      },
      set<T>(key: StateKey<T>, value: T, options?: StateOptions) {
        const { notify = true } = options ?? {};
        const previousValue = state.get(key);
        state.set(key, value);

        if (notify && !key.equals(previousValue, value)) {
          batch.append({ key, value });
        }
      },
      clear<T>(key: StateKey<T>, options?: StateOptions) {
        const { notify = true } = options ?? {};
        state.delete(key);
        if (notify) {
          batch.append({ key, value: undefined });
        }
      },

      event: changedEvent,
    };
    // We are not putting in 'props.initialValues' in the dependency list
    // because we only want it to take effect for the first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changedEvent]);

  // this  allows for additional scoped data, where we merge in parent values as they change.
  // This is useful for respecting user settings such as time or number settings, per chart
  useEventHandler(
    props.mergeState?.event,
    ({ key, value }) => {
      api.set(key, value);
    },
    [props.mergeState]
  );

  return <SharedStateContext.Provider value={api}>{props.children}</SharedStateContext.Provider>;
}
