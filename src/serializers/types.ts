export type EncodeFn<T> = (value: T) => string | undefined;
export type DecodeFn<T> = (text: string) => T | undefined;

export type Serializer<T> = {
  encode(value: T): string | undefined;
  decode(text: string): T | undefined;
};

export type Params<TObj> = {
  [TKey in keyof TObj]: TObj[TKey] extends Serializer<infer K> ? K : never;
};

export type ParamSerializers<T> = {
  [TKey in keyof T]: Serializer<T[TKey]>;
};
