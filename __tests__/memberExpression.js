const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('member expressions', () => {
  test('should identify dot operator', () => {
    const tree = parse(`cfc.property`);
    expect(tree[0].type).toBe('memberExpression');
    expect(tree[0].object.type).toBe('identifier');
    expect(tree[0].object.value).toBe('cfc');
    expect(tree[0].property.value).toBe('property');
  });

  test('should identify bracket operator', () => {
    const tree = parse(`cfc[property]`);
    expect(tree[0].type).toBe('memberExpression');
    expect(tree[0].object.type).toBe('identifier');
    expect(tree[0].object.value).toBe('cfc');
    expect(tree[0].property.value).toBe('property');
  });

  test('should allow strings in bracket notation', () => {
    const tree = parse(`cfc["property"]`);
    expect(tree[0].type).toBe('memberExpression');
    expect(tree[0].object.type).toBe('identifier');
    expect(tree[0].object.value).toBe('cfc');
    expect(tree[0].property.value).toBe('property');
  });

  test('should allow function calls in bracket notation', () => {
    const tree = parse(`cfc[method()]`);
    expect(tree[0].type).toBe('memberExpression');
    expect(tree[0].object.type).toBe('identifier');
    expect(tree[0].object.value).toBe('cfc');
    expect(tree[0].property.type).toBe('function');
    expect(tree[0].property.name).toBe('method');
  });

  test('should allow arbitrary whitespace in bracket notation', () => {
    const tree = parse(`cfc 
    	[ property	
		 ]`);
    expect(tree[0].type).toBe('memberExpression');
    expect(tree[0].object.type).toBe('identifier');
    expect(tree[0].object.value).toBe('cfc');
    expect(tree[0].property.value).toBe('property');
  });

  test('should allow arbitrary whitespace in dot notation', () => {
    const tree = parse(`cfc 
		. 
    	property`);
    expect(tree[0].type).toBe('memberExpression');
    expect(tree[0].object.type).toBe('identifier');
    expect(tree[0].object.value).toBe('cfc');
    expect(tree[0].property.value).toBe('property');
  });

  test('should allow function calls in bracket notation', () => {
    const tree = parse(`cfc.method()`);
    expect(tree[0].type).toBe('memberExpression');
    expect(tree[0].object.type).toBe('identifier');
    expect(tree[0].object.value).toBe('cfc');
    expect(tree[0].property.type).toBe('function');
    expect(tree[0].property.name).toBe('method');
  });

  test('should allow function calls as object', () => {
    const tree = parse(`generator().method()`);
    expect(tree[0].type).toBe('memberExpression');
    expect(tree[0].object.type).toBe('function');
    expect(tree[0].object.name).toBe('generator');
    expect(tree[0].property.type).toBe('function');
    expect(tree[0].property.name).toBe('method');
  });
});
