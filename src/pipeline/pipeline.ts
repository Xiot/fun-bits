
import isEqual from 'lodash/isEqual';
// import { type SerializerMap } from '../routes';
import { type SharedStateApi, type StateKey } from '..//shared-state';
import type { Serializer } from '../serializers';


type SerializerMap = Record<string, Serializer<any>>

export type BasePipelineApi = { state: SharedStateApi };
export type PipelineReducer<TApi extends BasePipelineApi, TReturn = any, TValue = any, TPrev = any> = (
  value: TValue,
  previousValue: TPrev,
  api: TApi
) => TReturn;
export type PipelineSideEffect<TApi extends BasePipelineApi, TValue = any, TPrev = any> = (
  value: TValue,
  previousValue: TPrev,
  api: TApi
) => void;


export const createPipeline = <TApi extends BasePipelineApi, TValue, TReturn>(api: TApi, fn: PipelineReducer<TApi, TReturn, TValue>) => {
  let previousValue: unknown = {};
  return (value: TValue) => {
    const nextValue = fn(value, previousValue, api);
    previousValue = nextValue;
    return nextValue;
  };
};

export const compose =
  <TApi extends BasePipelineApi>(...fns: PipelineReducer<TApi>[]): PipelineReducer<TApi> =>
    (value: unknown = {}, prevValue: unknown = {}, api: TApi) => {
      let lastValue = prevValue;
      return fns.reduce((value, fn, index) => {
        const newValue = fn(value, lastValue, api);
        // console.log('compose', index, lastValue, newValue);
        lastValue = value;
        return newValue;
      }, value);
    };

export const applyDecoders =
  <TApi extends BasePipelineApi>(serializers: SerializerMap): PipelineReducer<TApi> =>
    (value, prevValue) => {
      return Object.keys(serializers).reduce(

        (obj, key) => {
          const serializer = serializers[key];

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
  <TApi extends BasePipelineApi>(serializers: SerializerMap): PipelineReducer<TApi> =>
    (value, prevValue) => {
      return Object.keys(serializers).reduce(

        (obj, key) => {
          const serializer = serializers[key];

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
  <TApi extends BasePipelineApi>(): PipelineReducer<TApi> =>
    (value, prevValue) => ({
      ...prevValue,
      ...value,
    });

// Ensure that effects are processed outside of the render frame.
const defer =
  typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : (fn: () => void) => setTimeout(fn, 0);

export const executeSideEffects =
  <TApi extends BasePipelineApi>(...effects: PipelineSideEffect<TApi>[]): PipelineReducer<TApi> =>
    (value, previousValue, api: TApi) => {
      effects.forEach((effect) => {
        effect(value, previousValue, api);
      });
      return value;
    };

export const executeAsyncSideEffects =
  <TApi extends BasePipelineApi>(...effects: PipelineSideEffect<TApi>[]): PipelineReducer<TApi> =>
    (value, previousValue, api: TApi) => {
      if (effects.length === 0) return value;
      defer(() => {
        executeSideEffects(...effects);
      });
      return value;
    };

export const storeValue =
  <TApi extends BasePipelineApi>(key: StateKey): PipelineSideEffect<TApi> =>
    (value, previousValue, api) =>
      api.state.set(key, value, { notify: false });

export const clearOnChange =
  <TApi extends BasePipelineApi>(keyToClear: string, keys: string[]): PipelineReducer<TApi> =>
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
  <TApi extends BasePipelineApi>(idKey: string, stateToClear: StateKey): PipelineSideEffect<TApi> =>
    (value, _, { state }) => {
      if (value[idKey]) {
        return;
      }
      state.clear(stateToClear);
    };

export const ifChanged =
  <TApi extends BasePipelineApi>(key: string, effect: PipelineSideEffect<TApi>): PipelineSideEffect<TApi> =>
    (value, prevValue, api) => {
      if (!isEqual(value[key], prevValue[key])) {
        effect(value[key], prevValue[key], api);
      }
      return value;
    };

export const print =
  <TApi extends BasePipelineApi>(fn: string | PipelineReducer<TApi>): PipelineSideEffect<TApi> =>
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
