const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('identifiers', () => {
  test('should return a identifier', () => {
    const tree = parse(`myVar`);
    expect(tree[0].type).toBe('identifier');
    expect(tree[0].value).toBe('myVar');
  });

  test('should identify evaluated identifiers', () => {
    const tree = parse(`#myVar#`);
    expect(tree[0].type).toBe('identifier');
    expect(tree[0].value).toBe('myVar');
    expect(tree[0].useNumberSign).toBe(true);
  });

  test('should identify non-evaluated identifiers', () => {
    const tree = parse(`myVar`);
    expect(tree[0].type).toBe('identifier');
    expect(tree[0].value).toBe('myVar');
    expect(tree[0].useNumberSign).toBe(false);
  });
});
