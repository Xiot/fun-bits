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
