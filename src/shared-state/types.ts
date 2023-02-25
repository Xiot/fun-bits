// @flow

export type EqualityCheck<T> = (left: T, right: T) => boolean;
// flowlint-next-line unclear-type:off
export type StateKey<T = any> = { name: string, key: symbol, equals: EqualityCheck<T> };

export type StateOptions = {
  notify?: boolean,
};

export type SharedStateSetterValue<T> = T | ((T) => T);
export type SharedStateSetterOnly<T> = (value: SharedStateSetterValue<T>) => void;
export type SharedStateResult<T> = [T, (value: SharedStateSetterValue<T>, options?: StateOptions) => void];
