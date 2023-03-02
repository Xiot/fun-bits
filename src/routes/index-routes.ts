import { trimEnd, trimStart } from '../utils/string';
import { RouteDefinition, RouteNode, RouteNodeBucket, RoutePipelineApi, RoutePipelineTrigger } from './types';

const DEFAULT_HOOKS = {
  reducers: [],
  effects: [],
};

// TODO: Create root route so that we have a proper tree.
// add path finding (uri -> node)
// add navigation (current node > shared-parent > new node)
//  need to call onExit.reducers on the way up, and onEnter on the way down

export const createRoutes = (defs: RouteDefinition[]): RouteNodeBucket => {
  const nodeMap = new Map<string, RouteNode>();
  function createNode(def: RouteDefinition, parent: RouteNode | null): RouteNode {
    if (def.type === 'default') {
      const node: RouteNode = {
        path: parent?.path ?? '/',
        route: def,
        serializers: parent?.serializers ?? {},
        parent,
        children: [],
        onEnter: DEFAULT_HOOKS,
        onExit: DEFAULT_HOOKS,
      };
      nodeMap.set(def.name, node);
      return node;
    }

    const fullPath = join(parent?.path ?? '/', def.path);
    const node: RouteNode = {
      path: fullPath,
      route: def,
      parent,

      children: [],
      serializers: Object.assign({}, parent?.serializers ?? {}, def.type === 'view' ? def.params : {}),

      onEnter: normalizeHooks((def.type === 'view' && def.onEnter) || undefined),
      onExit: normalizeHooks((def.type === 'view' && def.onExit) || undefined),
    };

    nodeMap.set(def.name, node as RouteNode);

    node.children = def.type === 'view' ? def.children?.map((x) => createNode(x, node as RouteNode)) ?? [] : [];

    return node as RouteNode;
  }

  const root = {
    path: '/',
    serializers: {},
  };

  defs.forEach((x) => createNode(x, null));

  return {
    get(name: string) {
      return nodeMap.get(name);
    },
    all() {
      return Array.from(nodeMap.values());
    },
    definitions() {
      return Array.from(nodeMap.values(), (x) => x.route);
    },
  };
};

function normalizeHooks(
  hooks: Partial<RoutePipelineTrigger<RoutePipelineApi>> | undefined,
): RoutePipelineTrigger<RoutePipelineApi> {
  if (!hooks) return DEFAULT_HOOKS;
  return Object.assign({}, DEFAULT_HOOKS, hooks);
}

function join(left: string, right: string) {
  return `${trimSlashes(left)}/${trimSlashes(right)}`;
}

function trimSlashes(text: string) {
  return trimEnd(trimStart(text, '/'), '/');
}
