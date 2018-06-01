const parser = require('../src/parser'),
    parse = parser.parse;

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('Array', () => {
  test('should return an array', () => {
    const tree = parse(`['one', 'two', 'three'];`);
    expect(tree[0].expression.type).toBe('Array');
  });

  // TODO: the Expression rule already handles comma-delimited lists.
  // That doesn't seem ideal to me, but might be OK to leave as-is.
  // Need to decide if I want to override that behavior or change my tests to
  // match the new schema
  test('should allow arbitrary whitespace', () => {
    const tree = parse(`[ 			
      'one'  			,
         'two',
      'three'
    ];`);
    console.log(util.inspect(tree, {depth: null, colors: true}))
    expect(tree[0].expression.type).toBe('Array');
    expect(tree[0].expression.elements.length).toBe(3);
    expect(tree[0].expression.elements[0].value).toBe('one');
  });

  test('should allow mixed types', () => {
    const tree = parse(`[one, 'two', three(), {four: 4}, [5, 5, 5]];`);
    expect(tree[0].expression.type).toBe('Array');
    expect(tree[0].expression.elements[0].type).toBe('Identifier');
    expect(tree[0].expression.elements[0].value).toBe('one');
    expect(tree[0].expression.elements[1].type).toBe('String');
    expect(tree[0].expression.elements[1].value).toBe('two');
    expect(tree[0].expression.elements[2].type).toBe('Function');
    expect(tree[0].expression.elements[2].name).toBe('three');
    expect(tree[0].expression.elements[3].type).toBe('Struct');
    expect(tree[0].expression.elements[3].properties[0].key.value).toBe('four');
    expect(tree[0].expression.elements[4].type).toBe('Array');
    expect(tree[0].expression.elements[4].elements[0].value).toBe('5');
  });

  test('should throw on non-comma delimiters', () => {
    expect(() => {
      parse(`['one'| 'two'];`);
    }).toThrow();
  });

  // this, like the struct, might be ok? It feels risky to assume, but in essence maybe this would catch typos?
  test('should throw on multiple elements without delimiters', () => {
    expect(() => {
      parse(`['one' 'two'];`);
    }).toThrow();
  });

  test('should throw with unacceptable chars', () => {
    expect(() => {
      parse(`[=<];`);
    }).toThrow();
  });

  test('should throw with tags', () => {
    expect(() => {
      parse(`[<cfset i = 0 />];`);
    }).toThrow();
  });

  test('should allow ternary operators', () => {
    const tree = parse(`[true ? 'woo' : 'boo'];`);
    expect(tree[0].expression.type).toBe('Array');
    expect(tree[0].expression.elements[0].type).toBe('Ternary');
  });

  test('should allow empty array', () => {
    let tree = parse(`[];`);
    expect(tree[0].expression.type).toBe('Array');
    expect(tree[0].expression.elements.length).toBe(0);
    tree = parse(`[    ];`);
    expect(tree[0].expression.type).toBe('Array');
    expect(tree[0].expression.elements.length).toBe(0);
  });
});
