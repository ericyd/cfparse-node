const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('variables', () => {
  test('should return a variable', () => {
    const tree = parse(`myVar`);
    expect(tree[0].type).toBe('variable');
    expect(tree[0].value).toBe('myVar');
  });

  test('should identify evaluated variables', () => {
    const tree = parse(`#myVar#`);
    expect(tree[0].type).toBe('variable');
    expect(tree[0].value).toBe('myVar');
    expect(tree[0].useNumberSign).toBe(true);
  });

  test('should identify non-evaluated variables', () => {
    const tree = parse(`myVar`);
    expect(tree[0].type).toBe('variable');
    expect(tree[0].value).toBe('myVar');
    expect(tree[0].useNumberSign).toBe(false);
  });
});
