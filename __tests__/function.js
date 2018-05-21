const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('functions', () => {
  test('should return a function', () => {
    const tree = parse(`myFunction()`);
    expect(tree[0].type).toBe('function');
    expect(tree[0].name).toBe('myFunction');
    expect(tree[0].args.length).toBe(0);
  });
});
