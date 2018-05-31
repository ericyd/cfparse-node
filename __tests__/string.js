const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('String', () => {
  test('should return a string', () => {
    const tree = parse(`"mystring";`);
    expect(tree[0].type).toBe('String');
    expect(tree[0].value).toBe('mystring');
  });

  test('should allow non-ascii chars in string', () => {
    const tree = parse(`<cfdiv property='√↓►;)┴≡±¡╥-╝åD░║«Y╚á'></cfdiv>`);
    expect(tree[0].attributes[0].attr.value).toBe('property');
    expect(tree[0].attributes[0].value.value).toBe('√↓►;)┴≡±¡╥-╝åD░║«Y╚á');
  });

  test('should allow /> in string', () => {
    const tree = parse(`"/>";`);
    expect(tree[0].type).toBe('String');
    expect(tree[0].value).toBe('/>');
  });

  // In test strings, escape characters need to be escaped to emulate
  // an actual escape character in text.
  // If they are ommitted, it interprets the quotation mark as being escaped,
  // instead of a literal escape char then doublequote.
  // My guess is this is just the way string literals work
  test('should allow escaped double quotes in string', () => {
    const tree = parse(`"test\\"something\\"";`);
    expect(tree[0].type).toBe('String');
    expect(tree[0].value).toBe('test\\"something\\"');
  });

  test('should allow escaped single quotes in string', () => {
    const tree = parse(`'test\\'something\\'';`);
    expect(tree[0].type).toBe('String');
    expect(tree[0].value).toBe("test\\'something\\'");
  });
});
