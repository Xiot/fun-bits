import isEqual from 'lodash/isEqual';
import type { StateKey, EqualityCheck } from './types';

const propertyCompare =
  <T>(key: keyof T) =>
  (l: T | null | undefined, r: T | null | undefined) =>
    l?.[key] === r?.[key];

/**
 * createStateKey
 * @param name name of state
 * @param defaultValue the default value
 * @returns the state key
 */
export function createStateKey<T>(name: string, defaultValue?: T): StateKey<T>;

/**
 * createStateKey
 * @param name name of state
 * @param defaultValue the default value
 * @param equals the equality function
 * @returns the state key
 */
export function createStateKey<T>(name: string, defaultValue: T, equals: EqualityCheck<T>): StateKey<T>;

/**
 * createStateKey
 * @param name name of state
 * @param defaultValue the default value
 * @param idProperty the name of property that will be used to check for equality
 * @returns the state key
 */
export function createStateKey<T>(name: string, defaultValue: T, idProperty: keyof T): StateKey<T>;

export function createStateKey<T>(
  name: string,
  defaultValue?: T,
  equals: EqualityCheck<T> | keyof T = isEqual,
): StateKey<T> {
  const objectEquals = typeof equals === 'function' ? equals : propertyCompare<T>(equals);

  return { name, key: Symbol(name), __defaultValue: defaultValue, equals: objectEquals } as InternalStateKey<T>;
}

type InternalStateKey<T> = StateKey<T> & { __defaultValue?: T };
