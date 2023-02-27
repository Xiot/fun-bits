interface ObjectConstructor {
  keys<T extends Record<string, unknown>>(obj: T): Array<keyof T>;
}
