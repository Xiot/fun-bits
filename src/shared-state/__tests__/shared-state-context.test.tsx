import {SharedStateContext, SharedStateProvider} from '../shared-state-context'
import {createStateKey} from '../symbols';
import {render} from '@testing-library/react'
import { StateKey } from '../types';
import { useContext } from 'react';
import { useEventHandler } from '../../hooks/use-events';

describe('SharedStateProvider', () => {
  it('should get default value', () => {
    const key = createStateKey('test-key', 42)

    const onChanged = jest.fn();

    render(<SharedStateProvider>
      <ExtractValue stateKey={key} onChanged={onChanged} />
    </SharedStateProvider>)

    expect(onChanged).toHaveBeenCalledWith(42)
  })

  it('should set the value', () => {
    const key = createStateKey('test-key', 42)
    const onChanged = jest.fn();

    render(
      <SharedStateProvider>
        <SetValue stateKey={key} value={7} />
        <ExtractValue stateKey={key} onChanged={onChanged} />
      </SharedStateProvider>
    )

    expect(onChanged).toHaveBeenCalledWith(7)

  })

  it('should clear the key', () => {
    const key = createStateKey('test-key', 42)
    const onChanged = jest.fn();

    render(
      <SharedStateProvider>
        <Listen stateKey={key} onChanged={onChanged} />
        <ClearValue stateKey={key} />
      </SharedStateProvider>
    )

    expect(onChanged).toHaveBeenCalledWith(undefined)
  })

})

type ExtractValueProps<T> = {
  stateKey: StateKey<T>,
  onChanged: (value: T) => void
}

function ExtractValue<T>(props: ExtractValueProps<T>) {
  const ctx = useContext(SharedStateContext);

  const value = ctx.get(props.stateKey)
  props.onChanged(value)

  return null;
}

type SetValueProps<T> = {
  stateKey: StateKey<T>;
  value: T
}

function SetValue<T>(props: SetValueProps<T>) {
  const ctx = useContext(SharedStateContext);
  ctx.set(props.stateKey, props.value)
  return null;
}

type ClearValueProps<T> = {
  stateKey: StateKey<T>
}
function ClearValue<T>(props: ClearValueProps<T>) {
  const ctx = useContext(SharedStateContext);
  ctx.clear(props.stateKey);
  return null;
}

type ListenProps<T> = {
  stateKey: StateKey<T>
  onChanged: (value: T) => void;
}
function Listen<T>(props: ListenProps<T>) {
  const ctx = useContext(SharedStateContext)
  useEventHandler(
    ctx.event,
    ({ key, value }) => {
      if (key === props.stateKey) {
        props.onChanged(value)
      }
    },
    []
  );
  return null
}