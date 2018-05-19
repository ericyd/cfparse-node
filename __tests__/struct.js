const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('struct', () => {
  test('should return a struct', () => {
    const tree = parse(`{test: "test"}`);
    expect(tree[0].type).toBe('struct');
  });
});
