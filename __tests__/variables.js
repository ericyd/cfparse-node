const parser = require('../src/parser'),
    parse = parser.parse;

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('identifiers', () => {
  test('should return a identifier', () => {
    const tree = parse(`myVar;`);
    expect(tree[0].expression.type).toBe('Identifier');
    expect(tree[0].expression.value).toBe('myVar');
  });

  test('should identify evaluated identifiers', () => {
    const tree = parse(`#myVar#;`);
    expect(tree[0].expression.type).toBe('Identifier');
    expect(tree[0].expression.value).toBe('myVar');
    expect(tree[0].expression.evaluated).toBe(true);
  });

  test('should identify non-evaluated identifiers', () => {
    const tree = parse(`myVar;`);
    expect(tree[0].expression.type).toBe('Identifier');
    expect(tree[0].expression.value).toBe('myVar');
    expect(tree[0].expression.evaluated).toBe(false);
  });
});
