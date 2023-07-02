type Nullable<T> = T | null | undefined;

type CompareFn<T> = (left: T, right: T) => number;

export function cascade<T>(...comparators: CompareFn<T>[]): CompareFn<T> {
  return (l: T, r: T) => {
    for (const cmp of comparators) {
      const result = cmp(l, r);
      if (result !== 0) return result;
    }
    return 0;
  };
}

export function byProperty<T, TKey extends keyof T>(prop: TKey, fn: CompareFn<T[TKey]>): CompareFn<T> {
  return (l: T, r: T) => {
    const leftValue = l[prop];
    const rightValue = r[prop];
    return fn(leftValue, rightValue);
  };
}

export function byValue<T, TValue>(accessor: (item: T) => TValue, fn: CompareFn<TValue>): CompareFn<T> {
  return (l: T, r: T) => {
    const leftValue = accessor(l);
    const rightValue = accessor(r);
    return fn(leftValue, rightValue);
  };
}

export function ordered<T>(ordering: T[], fallback?: CompareFn<T>): CompareFn<T> {
  return (l: T, r: T) => {
    const leftIndex = ordering.indexOf(l);
    const rightIndex = ordering.indexOf(r);
    if (leftIndex === rightIndex) {
      return fallback?.(l, r) ?? 0;
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }
    return leftIndex < rightIndex ? -1 : 1;
  };
}

export function caseInsensitive(l: Nullable<string>, r: Nullable<string>): number {
  const left = l ?? '';
  const right = r ?? '';
  return left.toLocaleLowerCase().localeCompare(right.toLocaleLowerCase());
}

type C = {
  primary: boolean;
  mine: boolean | undefined;
  title: string;
};

const c: C[] = [];
c.sort(
  cascade(
    byProperty('primary', ordered([true, false])),
    byProperty('mine', ordered([true, false, undefined])),
    byProperty('title', caseInsensitive),
  ),
);

export const sortCalendars = (a, b) => {
  if (a.primary && !b.primary) {
    return -1;
  } else if (!a.primary && b.primary) {
    return 1;
  } else if (a.mine && !b.mine) {
    return -1;
  } else if (!a.mine && b.mine) {
    return 1;
  } else if (a.title.toLowerCase() < b.title.toLowerCase()) {
    return -1;
  }
  return 1;
};
