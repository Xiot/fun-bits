import { act, renderHook } from '@testing-library/react';
import { SharedStateProvider } from '../shared-state-context';
import { createStateKey } from '../symbols';
import { useSharedState } from '../use-shared-state';

const key = createStateKey<number>('test-key');

describe('useSharedState', () => {
  describe('read/write', () => {
    it('should get value', () => {

      const wrapper = renderHook(() => useSharedState(key), {
        wrapper: SharedStateProvider
      })

      expect(wrapper.result.current[0]).toBeUndefined()
    })

    it('should set value', () => {

      const wrapper = renderHook(() => useSharedState(key), {
        wrapper: SharedStateProvider
      })

      act(() => {
        wrapper.result.current[1](4)
      })
      wrapper.rerender()
      expect(wrapper.result.current[0]).toEqual(4)
    })
  })
})