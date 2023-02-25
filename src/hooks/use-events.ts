import { useEffect, useLayoutEffect, useMemo } from 'react';

const useIsomorphicLayoutEffect = __NODE__ ? useEffect : useLayoutEffect;

// flowlint-next-line unclear-type:off
type Handler<T> = (arg: T) => void | any;

interface Event<T> {
  subscribe(cb: Handler<T>): () => void;
  unsubscribe(cb: Handler<T>): void;
}

interface EventSource<T> extends Event<T> {
  fire(arg: T): void;
}

const EmptyArray: any[] = [];


type Dependencies = any[];

/**
  Subscribes to the provided event and handles unsubscribing when the component
  is unmounted or the dependencies change.
  @param event The Event to subscribe to
  @param cb The handler for the event. Will be called with the argument
             that is passed to the respective `EventSource.fire`
  @param deps Works similariy to `deps` on the built in hooks.
              If the dependencies change, then the event will be unsubscribed
              and resubscribed with the new closure.
 */
function useEventHandler<T>(
  event: Event<T> | null | undefined,
  cb: Handler<T>,
  deps: Dependencies = EmptyArray
): void {
  // useLayoutEffect so that the subscription happens sooner.
  useIsomorphicLayoutEffect(() => {
    if (!event) {
      return;
    }
    return event.subscribe(cb);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps]);
}

type EventCallback<T> = (arg: T) => void;
export function createEvent<T>(): EventSource<T> {
  let subscribers: EventCallback<T>[] = [];

  function fire(arg: T) {
    subscribers.forEach((sub) => {
      sub(arg);
    });
  }

  function subscribe(cb: EventCallback<T>) {
    subscribers.push(cb);
    return () => unsubscribe(cb);
  }

  function unsubscribe(cb: EventCallback<T>) {
    subscribers = subscribers.filter((sub) => sub !== cb);
  }

  return {
    fire,
    subscribe,
    unsubscribe,
  };
}

/**
  Creates a new Event
 */
function useEvent<T>(): EventSource<T> {
  return useMemo(() => {
    return createEvent();
  }, []);
}

export { useEvent, useEventHandler };
export type { EventSource, Event };
