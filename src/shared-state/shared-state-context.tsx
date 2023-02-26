// @flow
import { createContext, type ReactNode, useMemo } from 'react';

import { type EventSource, useEvent, useEventHandler } from '../hooks/use-events';
import type { StateKey, StateOptions } from './types';
import { useBatch } from '../hooks/use-batch';
import { chain } from '../utils/enumerable';

type EventArgs = {
  // flowlint-next-line unclear-type:off
  key: StateKey<any>,
  // flowlint-next-line unclear-type:off
  value: any,
};

type MapState = Map<StateKey<unknown>, unknown>;

export type SharedStateApi = {
  get<T>(key: StateKey<T>): T,
  set<T>(key: StateKey<T>, value: T, options?: StateOptions): void,
  clear<T>(key: StateKey<T>, options?: StateOptions): void,
  all(): { [key: symbol]: unknown },
  readonly event: EventSource<EventArgs>,
};
type InternalStateKey<T> = StateKey<T> & { __defaultValue?: T };

const throwContextNotFound = () => { throw new Error('The SharedStateContext.Provider was not found in the component tree.') }
const emptySharedState: SharedStateApi = {
  get: throwContextNotFound,
  set: throwContextNotFound,
  clear: throwContextNotFound,
  all: throwContextNotFound,
  // @ts-expect-error - no context
  event: null
};
export const SharedStateContext = createContext<SharedStateApi>(emptySharedState);

type SharedStateProviderProps = {
  children: ReactNode,
  initialValues?: MapState,

  mergeState?: SharedStateApi,

  // additionally, if one want to get a handle on the api of their child. use a ref
  // This is useful, when you want to relay/merge down state from say,
  // another shared state, higher up in the tree.
};

type PendingFireEvent = {
  key: StateKey<any>,
  // flowlint-next-line unclear-type:off
  value: any,
};

export function SharedStateProvider(props: SharedStateProviderProps) {
  const changedEvent = useEvent<EventArgs>();
  const batch = useBatch<PendingFireEvent>((events) => {
    // Batch the events by merging items with the same key
    const batchedEvents = chain(events)
      .groupBy(
        (e) => e.key,
        (e) => e.value
      )
      .map((g) => ({ key: g.key, value: g.values.at(-1)}))
      .toArray();

    batchedEvents.forEach((event) => changedEvent.fire(event));
  });

  const api = useMemo(() => {
    const state = new Map<StateKey<any>, any>(props.initialValues);

    const toObject: () => { [symbol: symbol]: unknown } = () =>
      Array.from(state.entries()).reduce((obj, [key, value]) => {
        obj[key.key] = value;
        return obj;
      }, Object.create(null));

    return {
      all() {
        return toObject();
      },
      get<T>(key: StateKey<T>): T {
        if (state.has(key)) {
          return state.get(key);
        }
        // @ts-expect-error - value will be there
        return (key as InternalStateKey<T>).__defaultValue;
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
  
  return <SharedStateContext.Provider value={ api }> { props.children } </SharedStateContext.Provider>;
}
