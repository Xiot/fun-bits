import { act, render, renderHook } from '@testing-library/react';
import { createEvent, useEventHandler } from '../../hooks';
import { SharedStateProvider } from '../shared-state-context';
import { createStateKey } from '../symbols';
import { StateKey } from '../types';
import { useSharedState } from '../use-shared-state';
import { EventSource } from '../../hooks';
import { useEffect } from 'react';

const key = createStateKey<number>('test-key');

describe('useSharedState', () => {
  describe('read/write', () => {
    it('should get value', () => {
      const wrapper = renderHook(() => useSharedState(key), {
        wrapper: SharedStateProvider,
      });

      expect(wrapper.result.current[0]).toBeUndefined();
    });

    it('should set value', () => {
      const wrapper = renderHook(() => useSharedState(key), {
        wrapper: SharedStateProvider,
      });

      act(() => {
        wrapper.result.current[1](4);
      });
      wrapper.rerender();
      expect(wrapper.result.current[0]).toEqual(4);
    });

    it('should work in component', async () => {
      const onUpdate = jest.fn();
      const trigger = createEvent<number>();

      render(
        <SharedStateProvider>
          <TestComponent stateKey={key} trigger={trigger} onUpdate={onUpdate} />
        </SharedStateProvider>,
      );

      await act(async () => {
        trigger.fire(7);
        await delay(1);
      });

      expect(onUpdate).toHaveBeenCalledWith(7);
    });
  });
});

const delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

type TestComponentProps = {
  stateKey: StateKey<number>;
  trigger: EventSource<number>;
  onUpdate: (value: number) => void;
};

function TestComponent(props: TestComponentProps) {
  const [value, setValue] = useSharedState(props.stateKey);

  useEventHandler(props.trigger, (value) => {
    setValue(value);
  });

  useEffect(() => {
    props.onUpdate(value);
  }, [value]);

  return null;
}
