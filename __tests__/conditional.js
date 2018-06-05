const parser = require('../src/parser'),
    parse = parser.parse;

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('ternary operator', () => {
  test('should return a ternary', () => {
    const tree = parse(`(true)?'true thing':'false thing';`);
    expect(tree[0].expression.type).toBe('ConditionalExpression');
    expect(tree[0].expression.condition.value).toBe(true);
    expect(tree[0].expression.truthy.value).toBe('true thing');
    expect(tree[0].expression.falsey.value).toBe('false thing');
  });
});
