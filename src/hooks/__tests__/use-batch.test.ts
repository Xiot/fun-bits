import { useBatch } from '../use-batch'
import { act, renderHook } from '@testing-library/react';

describe('useBatch', () => {
  it('should handle single update', async () => {
    jest.useFakeTimers()

    const cb = jest.fn();
    const wrapper = renderHook(() => useBatch(cb))

    act(() => {
      wrapper.result.current.append(4);
      jest.advanceTimersToNextTimer()
    })

    expect(cb).toHaveBeenCalledWith([4])
  })

  it('should batch updates', async () => {
    jest.useFakeTimers()

    const cb = jest.fn();
    const wrapper = renderHook(() => useBatch(cb))

    act(() => {
      wrapper.result.current.append(4);
      wrapper.result.current.append(5);
      jest.advanceTimersToNextTimer()
    })

    expect(cb).toHaveBeenCalledWith([4, 5])
  })
})