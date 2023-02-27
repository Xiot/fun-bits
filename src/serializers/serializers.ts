import type { Serializer, EncodeFn, DecodeFn } from "./types";
import { DateTime } from 'luxon';

function create<T>(encode: EncodeFn<T>, decode: DecodeFn<T>): Serializer<T> {
  return { encode, decode }
}

export const SERIALIZERS = {

  string: create<string>(x => x, x => x),
  int: create<number>(x => String(x), x => parseInt(x)),
  float: create<number>(x => String(x), x => parseFloat(x)),
  boolean: create<boolean>(value => String(value), text => text === 'true'),

  dateTime: create<DateTime>(value => value.toISO(), text => DateTime.fromISO(text)),



} satisfies Record<string, Serializer<any> | ((...args: any[]) => Serializer<any>)>;