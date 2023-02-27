const PARSE_TEMPLATE_RE = /(?::([^/]+)|\*)/gi;

type GroupedParams = {
  path: Record<string, unknown>;
  query: Record<string, unknown>;
};

export const groupParams = <T extends Record<string, unknown>>(obj: T, template: string) => {
  const routeArgs = Array.from(template.matchAll(PARSE_TEMPLATE_RE), (m) => m[1]);

  return Object.keys(obj).reduce(
    (acc, key) => {
      const target = routeArgs.includes(key as string) ? acc.path : acc.query;
      target[key as string] = obj[key];
      return acc;
    },
    { path: {}, query: {} } as GroupedParams,
  );
};
