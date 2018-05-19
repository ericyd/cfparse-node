const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('string', () => {
  test('should return a string', () => {
    const tree = parse(`"mystring"`);
    expect(tree[0].type).toBe('string');
    expect(tree[0].value).toBe('mystring');
  });
});
