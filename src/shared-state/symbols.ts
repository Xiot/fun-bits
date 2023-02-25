// @flow
/* eslint-disable no-redeclare */

import isEqual from 'lodash/isEqual';
import type { StateKey, EqualityCheck } from './types';

const propertyCompare =
  (key) =>
  <T>(l: T, r: T) =>
    // $FlowFixMe - the keys will be there
    l?.[key] === r?.[key];

/**
 * createStateKey
 * @param name name of state
 * @param defaultValue the default value
 * @returns the state key
 */
declare function createStateKey<T>(name: string, defaultValue?: T): StateKey<T>;

/**
 * createStateKey
 * @param name name of state
 * @param defaultValue the default value
 * @param equals the equality function
 * @returns the state key
 */
declare function createStateKey<T: ?{}>(
  name: string,
  defaultValue: T,
  equals: EqualityCheck<T>
): StateKey<T>;

/**
 * createStateKey
 * @param name name of state
 * @param defaultValue the default value
 * @param idProperty the name of property that will be used to check for equality
 * @returns the state key
 */
declare function createStateKey<T: ?{}>(
  name: string,
  defaultValue: T,
  idProperty: $Keys<$NonMaybeType<T>>
): StateKey<T>;

export function createStateKey<T>(
  name: string,
  defaultValue?: T,
  // $FlowFixMe - proper types are captured above
  equals?: EqualityCheck<T> | $Keys<$NonMaybeType<T>> = isEqual
): StateKey<T> {
  if (typeof equals === 'string') {
    equals = propertyCompare(equals);
  }

  return { name, key: Symbol(name), __defaultValue: defaultValue, equals };
}
