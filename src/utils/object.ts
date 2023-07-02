// export function createLookup<T, TMap extends Record<string, T>>(
//   obj: TMap,
//   defaultKey: keyof TMap,
//   normalizer?: (key: keyof TMap) => keyof TMap,
// ): (key: keyof TMap) => T

// export function createLookup<T, TMap extends Record<string, T>>(
//   obj: TMap,
//   defaultKey: keyof TMap,
//   normalizer: (key: keyof TMap) => keyof TMap,
// ): (key: string) => T;

export function createLookup<T, TMap extends Record<string, T> = Record<string, T>>(
  obj: TMap,
  defaultKey: keyof TMap,
  normalizer: (key: string) => string = (key) => key,
) {
  return (key: string): TMap[keyof TMap] => {
    const normalizedKey = normalizer(key) as keyof TMap;
    const value = obj[normalizedKey] ?? obj[defaultKey];
    return value;
  };
}

const l = createLookup(
  {
    foo: 'hello',
    default: 'foo',
  },
  'default',
);

export function createMatch<
  T,
  TMap extends Record<string, (matches: string[]) => T> = Record<string, (matches: string[]) => T>,
>(obj: TMap, defaultKey: keyof TMap, normalizer: (key: string) => string = (key) => key) {
  const items = Object.entries(obj).map(([exp, fn]) => ({ re: new RegExp(exp), fn }));

  return (key: string): ReturnType<TMap[keyof TMap]> => {
    const normalizedKey = normalizer(key);

    for (const item of items) {
      const match = item.re.exec(normalizedKey);
      if (!match) continue;
      const value = item.fn(match);
      if (value == null) continue;
      return value as ReturnType<TMap[keyof TMap]>;
    }
    return obj[defaultKey]([]) as ReturnType<TMap[keyof TMap]>;
  };
}
