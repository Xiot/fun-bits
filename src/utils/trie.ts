type Node<T> = {
  segment: string;

  children: Node<T>[];
  value: T | null;

  parent: Node<T> | null;
};
export type Visitor<T> = (ctx: WalkContext<T>) => void;
export type WalkContext<T> = {
  readonly node: Node<T>;
  readonly segments: string[];

  readonly pathIndex: number;
  readonly pathLength: number;
  readonly isLastSegment: boolean;
};

export class Trie<T> {
  private root: Node<T>;

  constructor() {
    this.root = { segment: '', children: [], value: null, parent: null };
  }

  add(value: T, ...path: string[]) {
    let current = this.root;
    for (const segment of path) {
      const node = this.getOrCreate(segment, current);
      current = node;
    }
    current.value = value;
  }

  collect(...segments: string[]): T extends Array<T> ? T[] : T {
    const values: T[] = [];
    this.walk(segments, (ctx) => {
      if (ctx.node.value != null) {
        values.push(ctx.node.value);
      }
    });
    return values.flat() as T extends Array<T> ? T[] : T;
  }

  getLeaf(...segments: string[]): Node<T> | null {
    let leaf: Node<T> | null = null;
    this.walk(segments, (ctx) => (leaf = ctx.node));
    return leaf;
  }

  collectNodes(...paths: string[]) {
    let current = this.root;
    const values: Node<T>[] = [];

    for (const segment of paths) {
      const node = current.children.find((x) => x.segment === segment);
      if (node == null) {
        break;
      }

      if (node.value != undefined) {
        values.push(node);
      }
      current = node;
    }
    return values.flat();
  }

  private qualifiedPath(node: Node<T>): string[] {
    const segments: string[] = [];

    let current: Node<T> | null = node;
    while (current != null) {
      segments.push(current.segment);
      current = current.parent;
    }
    return segments;
  }

  walk(segments: string[], collector: (ctx: WalkContext<T>) => void) {
    let current = this.root;

    for (let idx = 0; idx < segments.length; idx++) {
      const segment = segments[idx];
      const node = current.children.find((x) => x.segment === segment);
      if (node == null) {
        break;
      }

      collector({
        node,
        segments,
        pathIndex: idx,
        pathLength: segments.length,
        isLastSegment: idx === segments.length - 1,
      });

      current = node;
    }
  }

  toJSON() {
    return JSON.parse(JSON.stringify(this.root, replacer));
  }

  private getOrCreate(segment: string, node = this.root): Node<T> {
    const found = node.children.find((n) => n.segment === segment);
    if (found) return found;
    const newChild = { segment, children: [], value: null, parent: node };

    node.children.push(newChild);
    return newChild;
  }
}

function replacer(key: string, value: any) {
  if (key === 'parent') return undefined;
  if (key === 'value' && value == null) return undefined;
  if (key === 'children' && !value.length) return undefined;
  return value;
}
