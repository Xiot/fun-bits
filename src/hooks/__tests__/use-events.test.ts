import { act, renderHook } from '@testing-library/react';
import { createEvent, useEventHandler } from '../use-events';

describe('events', () => {
  it('should create an event', () => {
    const ev = createEvent<number>();

    const handler = jest.fn();
    const unsub = ev.subscribe(handler);
    ev.fire(4);
    expect(handler).toHaveBeenCalledWith(4)
    unsub();

    ev.fire(6);
    expect(handler).not.toHaveBeenCalledWith(6)
  })

  it('should use hook', () => {
    const ev = createEvent<number>();
    const handler = jest.fn();
    const wrapper = renderHook(() => useEventHandler(ev, handler))

    act(() => {
      ev.fire(3);
    })
    expect(handler).toHaveBeenCalledWith(3);

    // unmount unsubscribes
    wrapper.unmount();

    act(() => {
      ev.fire(7);
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).not.toHaveBeenCalledWith(7)

  })
})