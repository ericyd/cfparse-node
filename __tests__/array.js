const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('array', () => {
  test('should return an array', () => {
    const tree = parse(`['one', 'two', 'three']`);
    expect(tree[0].type).toBe('array');
  });

  test('should allow arbitrary whitespace', () => {
    const tree = parse(`[ 			
      'one'  			,
         'two',
      'three'
    ]`);
    expect(tree[0].type).toBe('array');
    expect(tree[0].elements.length).toBe(3);
    expect(tree[0].elements[0].value).toBe('one');
  });

  test('should allow mixed types', () => {
    const tree = parse(`[one, 'two', three(), {four: 4}, [5, 5, 5]]`);
    expect(tree[0].type).toBe('array');
    expect(tree[0].elements[0].type).toBe('identifier');
    expect(tree[0].elements[0].value).toBe('one');
    expect(tree[0].elements[1].type).toBe('string');
    expect(tree[0].elements[1].value).toBe('two');
    expect(tree[0].elements[2].type).toBe('function');
    expect(tree[0].elements[2].name).toBe('three');
    expect(tree[0].elements[3].type).toBe('struct');
    expect(tree[0].elements[3].properties[0].key.value).toBe('four');
    expect(tree[0].elements[4].type).toBe('array');
    expect(tree[0].elements[4].elements[0].value).toBe('5');
  });

  test('should throw on non-comma delimiters', () => {
    expect(() => {
      parse(`['one'| 'two']`);
    }).toThrow();
  });

  // this, like the struct, might be ok? It feels risky to assume, but in essence maybe this would catch typos?
  test('should throw on multiple elements without delimiters', () => {
    expect(() => {
      parse(`['one' 'two']`);
    }).toThrow();
  });

  test('should throw with unacceptable chars', () => {
    expect(() => {
      parse(`[=<]`);
    }).toThrow();
  });

  test('should throw with tags', () => {
    expect(() => {
      parse(`[<cfset i = 0 />]`);
    }).toThrow();
  });

  test('should allow ternary operators', () => {
    const tree = parse(`[true ? 'woo' : 'boo']`);
    expect(tree[0].type).toBe('array');
    expect(tree[0].elements[0].type).toBe('ternary');
  });

  test('should allow empty array', () => {
    let tree = parse(`[]`);
    expect(tree[0].type).toBe('array');
    expect(tree[0].elements.length).toBe(0);
    tree = parse(`[    ]`);
    expect(tree[0].type).toBe('array');
    expect(tree[0].elements.length).toBe(0);
  });
});
