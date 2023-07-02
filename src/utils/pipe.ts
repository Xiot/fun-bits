// v2 ---------------------------
type PipeFlags<TMap> = {
  [TKey in keyof TMap as TKey extends `_${infer B}` ? never : TKey]: boolean;
};
type PipeFn<T> = (term: T) => T;

type PipeFn2<T, TMap> = (term: T, flags: TMap) => T;

type F = PipeFlags<{ _base: string; other: number }>;

function definePipe<TValue>() {
  return {
    with<TMap extends Record<string, PipeFn<TValue>>>(
      ops: TMap,
    ): (flags: PipeFlags<TMap>) => (value: TValue) => TValue {
      return (flags) => (value) => {
        return Object.keys(ops).reduce((acc, key) => {
          if (!String(key).startsWith('_') && !flags[String(key)]) return acc;
          return ops[key](acc);
        }, value);
      };
    },
  };
}

// ---------------------------

const pipelineDefinition = definePipe<string>().with({
  _base: (value) => value.replace(/[^a-z0-9]/gi, '-'),
  strict: (value) => value.replace(/(\B[A-Z])/g, (whole, letter) => '-' + letter.toLowerCase()),
  _lower: (value) => value.toLowerCase(),
});

const pipeline = pipelineDefinition({ strict: false });

const e = pipeline('color lightPurple');
console.log(e);
