
export type EncodeFn<T> = (value: T) => string | undefined;
export type DecodeFn<T> = (text: string) => T | undefined;

export type Serializer<T> = {
  encode(value: T): string | undefined
  decode(text: string): T | undefined
}

