const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('array', () => {
  test('should return an array', () => {
    const tree = parse(`['one', 'two', 'three']`);
    expect(tree[0].type).toBe('array');
  });
});
