import { Trie } from '../trie';

describe('trie', () => {
  it('should add single node', () => {
    const tree = new Trie<number>();
    tree.add(2, 'hello', 'world');

    expect(tree.toJSON()).toMatchObject({
      segment: '',
      children: [{ segment: 'hello', children: [{ segment: 'world', value: 2 }] }],
    });
  });

  it('should support multiple children', () => {
    const tree = new Trie<number>();
    tree.add(2, 'hello', 'world');
    tree.add(3, 'hello', 'developer');

    expect(tree.toJSON()).toMatchObject({
      segment: '',
      children: [
        {
          segment: 'hello',
          children: [
            { segment: 'world', value: 2 },
            { segment: 'developer', value: 3 },
          ],
        },
      ],
    });
  });
  it('should support values on non leaf nodes', () => {
    const tree = new Trie<number>();
    tree.add(2, 'hello');
    tree.add(3, 'hello', 'developer');

    expect(tree.toJSON()).toMatchObject({
      segment: '',
      children: [
        {
          segment: 'hello',
          value: 2,
          children: [{ segment: 'developer', value: 3 }],
        },
      ],
    });
  });

  it('should collect values', () => {
    const tree = new Trie<number>();
    tree.add(2, 'hello');
    tree.add(3, 'hello', 'developer');

    const actual = tree.collect('hello', 'developer');
    expect(actual).toEqual([2, 3]);
  });

  it('should collect nodes', () => {
    const tree = new Trie<number>();
    tree.add(2, 'hello');
    tree.add(3, 'hello', 'developer');

    const nodes = tree.collectNodes('hello', 'developer');
    expect(nodes).toHaveLength(2);
  });

  it('should collect the leaf from a full path', () => {
    const tree = new Trie<number>();
    tree.add(2, 'hello');
    tree.add(3, 'hello', 'developer');

    const leaf = tree.getLeaf('hello', 'developer');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(leaf!.segment).toEqual('developer');
  });

  it('should collect the leaf from a partial path', () => {
    const tree = new Trie<number>();
    tree.add(2, 'hello');
    tree.add(3, 'hello', 'developer');

    const leaf = tree.getLeaf('hello');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(leaf!.segment).toEqual('hello');
  });

  it('should collect the leaf from a path that has more segments', () => {
    const tree = new Trie<number>();
    tree.add(2, 'hello');
    tree.add(3, 'hello', 'developer');

    const leaf = tree.getLeaf('hello', 'developer', 'stuff');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(leaf!.segment).toEqual('developer');
  });
});
