// @flow
// flowlint unclear-type:off

const OperationRemove = Symbol('@@remove');
const OperationBreak = Symbol('@@break');
const OperationKey = Symbol('operation');

interface Operation {
  <TInput, TOutput>(value: TInput): TOutput | TOutput[] | symbol;
  flatten?: boolean;
}

export function chain<T>(source: Iterable<T>): IEnumerable<T> {
  return new EnumerableFast<T, T>(source);
}

interface CompareFunction<T> {
  (left: T, right: T): number;
}

export interface Group<TKey, TValue> {
  key: TKey;
  values: TValue[];
}

export interface IEnumerable<TValue> extends Iterable<TValue> {
  map<U>(fn: (value: TValue) => U): IEnumerable<U>;
  filter(predicate: (value: TValue) => boolean): IEnumerable<TValue>;

  take(count: number): IEnumerable<TValue>;
  skip(count: number): IEnumerable<TValue>;

  distinct(): IEnumerable<TValue>;

  groupBy<TKey, TItem: TValue>(
    keySelector: (value: TValue) => TKey
  ): IEnumerable<Group<TKey, TValue>>;

  groupBy<TKey, TItem>(
    keySelector: (value: TValue) => TKey,
    valueSelector: (value: TValue) => TItem
  ): IEnumerable<Group<TKey, TItem>>;

  as<T>(): IEnumerable<T>;

  sort(compareFn?: CompareFunction<TValue>): IEnumerable<TValue>;

  find(predicate: (value: TValue) => boolean): ?TValue;
  first(): ?TValue;

  reduce<U>(reducer: (acc: U, value: TValue) => U, initialValue: U): U;
  toArray(): TValue[];
}

class EnumerableFast<TSource, TValue> implements IEnumerable<TValue> {
  source: Iterable<TSource>;
  ops: Operation[];

  constructor(source: Iterable<TSource>, ops?: Operation[] = []) {
    this.source = source;
    this.ops = ops;
  }

  map<U>(fn: (value: TValue) => U): IEnumerable<U> {
    return this.append(map(fn));
  }

  filter(predicate: (value: TValue) => boolean): IEnumerable<TValue> {
    return this.append(filter(predicate));
  }

  take(count: number): IEnumerable<TValue> {
    return this.append(take(count));
  }

  skip(count: number): IEnumerable<TValue> {
    return this.append(skip(count));
  }

  distinct(): IEnumerable<TValue> {
    return this.append(distinct());
  }

  reduce<U>(reducer: (acc: U, value: TValue) => U, initialValue: U) {
    return reduce(reducer, initialValue)(this);
  }

  as<T>(): IEnumerable<T> {
    return (this: any);
  }

  sort(compareFn?: (left: TValue, right: TValue) => number): IEnumerable<TValue> {
    return sort(compareFn)(this);
  }

  find(predicate: (value: TValue) => boolean): ?TValue {
    return find(predicate)(this);
  }

  first(): ?TValue {
    return find((x) => !!x)(this);
  }

  // Flow can't deal with different overloads having
  // different sets of generic arguments.
  // This class is only exposed through the interface,
  // so we should still have proper typings.
  groupBy<TKey, TItem>(
    keySelector: (value: TValue) => TKey,
    valueSelector?: (value: TValue) => TItem
  ): any {
    return groupBy(keySelector, valueSelector)(this);
  }

  append<U>(op: (value: TValue) => U | U[] | symbol): IEnumerable<U> {
    return new EnumerableFast<TSource, U>(this.source, [
      ...this.ops,
      // $FlowFixMe - Types match
      (op: Operation),
    ]);
  }

  toArray(): TValue[] {
    return Array.from(this);
  }

  *createIterator() {
    for (const item of this.source) {
      let value = item;
      for (const op of this.ops) {
        value = op(value);
        if (shouldSkip(value)) {
          break;
        }
      }

      if (shouldBreak(value)) {
        return;
      } else if (shouldSkip(value)) {
        continue;
      }

      yield value;
    }
  }

  // Computed property keys not supported.
  // https://stackoverflow.com/questions/48491307/iterable-class-in-flow
  // $FlowFixMe
  [Symbol.iterator](): Iterator<TValue> {
    return this.createIterator();
  }

  // This block makes Flow deal with custom iterators correctly.
  // It does however make `uber-web upgrade` break.
  // Comment this out when running `uber-web upgrade`
  /*::
  @@iterator(): Iterator<TValue> {
    // $FlowFixMe
    return this._source[Symbol.iterator]()
  }
  */
}

interface TypedOperation<TInput, TOutput> {
  (value: TInput): TOutput | TOutput[] | symbol;
}
interface ComposeOutput<TSource, TValue> {
  (source: Iterable<TSource>): IEnumerable<TValue>;
}

// eslint-disable-next-line no-redeclare
declare function compose<T1, T2>(o1: TypedOperation<T1, T2>): ComposeOutput<T1, T2>;

// eslint-disable-next-line no-redeclare
declare function compose<T1, T2, T3>(
  o1: TypedOperation<T1, T2>,
  o2: TypedOperation<T2, T3>
): ComposeOutput<T1, T3>;

// eslint-disable-next-line no-redeclare
export function compose(...ops: any[]) {
  return (source) => new EnumerableFast(source, ops);
}

export function filter<TSource>(
  predicate: (value: TSource) => boolean
): TypedOperation<TSource, TSource> {
  return (value: TSource) => (predicate(value) ? value : OperationRemove);
}

export function map<TValue, TMapped>(
  mapper: (value: TValue) => TMapped
): TypedOperation<TValue, TMapped> {
  return mapper;
}

export function take<TValue>(count: number): TypedOperation<TValue, TValue> {
  let index = 0;
  return (value) => (index++ < count ? value : OperationBreak);
}

export function skip<TValue>(count: number): TypedOperation<TValue, TValue> {
  let index = 0;
  return (value) => (index++ < count ? OperationRemove : value);
}

export function distinct<TValue>(): TypedOperation<TValue, TValue> {
  const keys = new Set();
  return (value) => {
    if (keys.has(value)) {
      return OperationRemove;
    }
    keys.add(value);
    return value;
  };
}

export function reduce<TSource, TValue>(
  reducer: (acc: TValue, value: TSource) => TValue,
  initialValue: TValue
): (source: Iterable<TSource>) => TValue {
  return (source: Iterable<TSource>) => {
    let result = initialValue;
    for (const value of source) {
      result = reducer(result, value);
    }
    return result;
  };
}

export function find<TValue>(
  predicate: (value: TValue) => boolean
): (source: Iterable<TValue>) => ?TValue {
  return (source) => {
    for (const value of source) {
      if (predicate(value)) {
        return value;
      }
    }
    return undefined;
  };
}

export function sort<TValue>(
  compareFn?: CompareFunction<TValue>
): (source: Iterable<TValue>) => IEnumerable<TValue> {
  return (source) => {
    const arr = Array.from(source);
    arr.sort(compareFn);
    return new EnumerableFast<TValue, TValue>(arr);
  };
}

export function groupBy<TValue, TKey, TItem>(
  keySelector: (value: TValue) => TKey,
  valueSelector?: (value: TValue) => TItem
): (source: Iterable<TValue>) => IEnumerable<Group<TKey, TItem>> {
  return (source) => {
    const lookup = new Map<TKey, Group<TKey, TItem>>();

    let getValue: (value: TValue) => TItem = valueSelector || (valueSelector = (x) => (x: any));

    const get = (key: TKey): Group<TKey, TItem> => {
      const container = lookup.get(key);
      if (container) {
        return container;
      }
      const newContainer = { key, values: [] };
      lookup.set(key, newContainer);
      return newContainer;
    };

    for (const value of source) {
      const key = keySelector(value);
      const container = get(key);
      const transformed = getValue(value);
      container.values.push(transformed);
    }
    return chain<Group<TKey, TItem>>(lookup.values());
  };
}

function shouldSkip(value: any): boolean {
  return value === OperationBreak || value === OperationRemove;
}

function shouldBreak(value: any): boolean {
  if (!value) {
    return false;
  }
  return value === OperationBreak || value[OperationKey] === OperationBreak;
}
