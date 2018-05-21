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

  test('should allow non-ascii chars in string', () => {
    const tree = parse(`"√↓►;)┴≡±¡╥-╝åD░║«Y╚á"></cfdiv>`);
    expect(tree[0].type).toBe('string');
    expect(tree[0].value).toBe('√↓►;)┴≡±¡╥-╝åD░║«Y╚á');
  });

  test('should allow /> in string', () => {
    const tree = parse(`"/>"`);
    expect(tree[0].type).toBe('string');
    expect(tree[0].value).toBe('/>');
  });

  test('should allow escaped double quotes in string', () => {
    const tree = parse(`"test\"something\""`);
    // console.log(util.inspect(tree, { depth: null, colors: true }));
    expect(tree[0].type).toBe('string');
    expect(tree[0].value).toBe('test"something"');
  });

  test('should allow escaped single quotes in string', () => {
    const tree = parse(`'test\'something\''`);
    // console.log(util.inspect(tree, { depth: null, colors: true }));
    expect(tree[0].type).toBe('string');
    expect(tree[0].value).toBe("test'something'");
  });
});
