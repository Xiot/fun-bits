// @flow
import isEqual from 'lodash/isEqual';
import { type SerializerMap } from '../../routes';
import { type SharedStateApi, type StateKey } from '../../contexts/shared-state';

// flowlint-next-line unclear-type:off
type unknown = any;

export type BasePipelineApi = { state: SharedStateApi };
export type PipelineReducer<T: BasePipelineApi> = (
  value: unknown,
  previousValue: unknown,
  api: T
) => unknown;
export type PipelineSideEffect<T: BasePipelineApi> = (
  value: unknown,
  previousValue: unknown,
  api: T
) => void;

export const createPipeline = <T: BasePipelineApi>(api: T, fn: PipelineReducer<T>) => {
  let previousValue = {};
  return (value: unknown) => {
    const nextValue = fn(value, previousValue, api);
    previousValue = nextValue;
    return nextValue;
  };
};

export const compose =
  <T: BasePipelineApi>(...fns: PipelineReducer<T>[]): PipelineReducer<T> =>
  (value: unknown = {}, prevValue: unknown = {}, api: T) => {
    let lastValue = prevValue;
    return fns.reduce((value, fn, index) => {
      const newValue = fn(value, lastValue, api);
      // console.log('compose', index, lastValue, newValue);
      // lastValue = newValue;
      return newValue;
    }, value);
  };

export const applyDecoders =
  <T: BasePipelineApi>(serializers: SerializerMap): PipelineReducer<T> =>
  (value, prevValue) => {
    return Object.keys(serializers).reduce(
      // flowlint-next-line unclear-type:off
      (obj, key) => {
        const serializer = serializers[key];
        // $FlowFixMe - this will be fine.
        const decoded = serializer.decode(value[key]);
        if (decoded !== undefined) {
          obj[key] = decoded;
        }
        return obj;
      },
      Object.create(null)
    );
  };

export const applyEncoders =
  <T: BasePipelineApi>(serializers: SerializerMap): PipelineReducer<T> =>
  (value, prevValue) => {
    return Object.keys(serializers).reduce(
      // flowlint-next-line unclear-type:off
      (obj, key) => {
        const serializer = serializers[key];
        // $FlowFixMe - this will be fine.
        const encoded = serializer.encode(value[key]);
        if (encoded !== undefined) {
          obj[key] = encoded;
        }
        return obj;
      },
      Object.create(null)
    );
  };

export const mergeWithPrevious =
  <T: BasePipelineApi>(): PipelineReducer<T> =>
  (value, prevValue) => ({
    ...prevValue,
    ...value,
  });

// Ensure that effects are processed outside of the render frame.
const defer =
  // eslint-disable-next-line cup/no-undef
  typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : (fn) => setTimeout(fn, 0);

export const executeSideEffects =
  <T: BasePipelineApi>(...effects: PipelineSideEffect<T>[]): PipelineReducer<T> =>
  (value, previousValue, api: T) => {
    effects.forEach((effect) => {
      effect(value, previousValue, api);
    });
    return value;
  };

export const executeAsyncSideEffects =
  <T: BasePipelineApi>(...effects: PipelineSideEffect<T>[]): PipelineReducer<T> =>
  (value, previousValue, api: T) => {
    if (effects.length === 0) return value;
    defer(() => {
      executeSideEffects(...effects);
    });
    return value;
  };

export const storeValue =
  <T: BasePipelineApi>(key: StateKey<>): PipelineSideEffect<T> =>
  (value, previousValue, api) =>
    api.state.set(key, value, { notify: false });

export const clearOnChange =
  <T: BasePipelineApi>(keyToClear: string, keys: string[]): PipelineReducer<T> =>
  (value, prevValue) => {
    // If the 'keyToClear' has also changed then we can 'assume' that it is intentional
    if (value[keyToClear] !== prevValue[keyToClear]) {
      return value;
    }

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (value[key] !== prevValue[key]) {
        delete value[keyToClear];
        return value;
      }
    }
    return value;
  };

export const clearStateOnMissing =
  <T: BasePipelineApi>(idKey: string, stateToClear: StateKey<>): PipelineSideEffect<T> =>
  (value, _, { state }) => {
    if (value[idKey]) {
      return;
    }
    state.clear(stateToClear);
  };

export const ifChanged =
  <T: BasePipelineApi>(key: string, effect: PipelineSideEffect<T>): PipelineSideEffect<T> =>
  (value, prevValue, api) => {
    if (!isEqual(value[key], prevValue[key])) {
      effect(value[key], prevValue[key], api);
    }
    return value;
  };

export const print =
  <T: BasePipelineApi>(fn: string | PipelineReducer<T>): PipelineSideEffect<T> =>
  (value, prevValue, api) => {
    if (typeof fn === 'string') {
      // eslint-disable-next-line no-console
      console.debug(fn, value);
    } else {
      const result = fn(value, prevValue, api);
      // eslint-disable-next-line no-console
      console.debug(...(Array.isArray(result) ? result : [result]));
    }
    return value;
  };
