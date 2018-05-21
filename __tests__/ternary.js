const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('ternary operator', () => {
  test('should return a ternary', () => {
    const tree = parse(`(true)?'true thing':'false thing'`);
    expect(tree[0].type).toBe('ternary');
    expect(tree[0].condition).toBe('true');
    expect(tree[0].ifBlock.value).toBe('true thing');
    expect(tree[0].elseBlock.value).toBe('false thing');
  });
});
