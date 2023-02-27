export type EqualityCheck<T> = (left: T, right: T) => boolean;

export type StateKey<T = unknown> = { name: string; key: symbol; equals: EqualityCheck<T> };

export type StateOptions = {
  notify?: boolean;
};

export type SharedStateSetterValue<T> = T | ((value: T) => T);
export type SharedStateSetterOnly<T> = (value: SharedStateSetterValue<T>) => void;
export type SharedStateResult<T> = [T, (value: SharedStateSetterValue<T>, options?: StateOptions) => void];

export type InternalStateKey<T> = StateKey<T> & { __defaultValue?: T };
