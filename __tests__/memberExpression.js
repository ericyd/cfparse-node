const parser = require('../src/parser'),
    parse = parser.parse;

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('member expressions', () => {
  test('should identify dot operator', () => {
    const tree = parse(`cfc.property;`);
    expect(tree[0].type).toBe('MemberExpression');
    expect(tree[0].object.type).toBe('Identifier');
    expect(tree[0].object.value).toBe('cfc');
    expect(tree[0].property.value).toBe('property');
    expect(tree[0].computed).toBe(false);
  });

  test('should identify bracket operator', () => {
    const tree = parse(`cfc[property];`);
    expect(tree[0].type).toBe('MemberExpression');
    expect(tree[0].object.type).toBe('Identifier');
    expect(tree[0].object.value).toBe('cfc');
    expect(tree[0].property.value).toBe('property');
    expect(tree[0].computed).toBe(true);
  });

  test('should allow strings in bracket notation', () => {
    const tree = parse(`cfc["property"];`);
    expect(tree[0].type).toBe('MemberExpression');
    expect(tree[0].object.type).toBe('Identifier');
    expect(tree[0].object.value).toBe('cfc');
    expect(tree[0].property.value).toBe('property');
    expect(tree[0].computed).toBe(true);
  });

  test('should allow function calls in bracket notation', () => {
    const tree = parse(`cfc[method()];`);
    expect(tree[0].type).toBe('MemberExpression');
    expect(tree[0].object.type).toBe('Identifier');
    expect(tree[0].object.value).toBe('cfc');
    expect(tree[0].property.type).toBe('Function');
    expect(tree[0].property.name).toBe('method');
    expect(tree[0].computed).toBe(true);
  });

  test('should allow arbitrary whitespace in bracket notation', () => {
    const tree = parse(`cfc 
    	[ property	
		 ];`);
    expect(tree[0].type).toBe('MemberExpression');
    expect(tree[0].object.type).toBe('Identifier');
    expect(tree[0].object.value).toBe('cfc');
    expect(tree[0].property.value).toBe('property');
    expect(tree[0].computed).toBe(true);
  });

  test('should allow arbitrary whitespace in dot notation', () => {
    const tree = parse(`cfc 
		. 
    	property;`);
    expect(tree[0].type).toBe('MemberExpression');
    expect(tree[0].object.type).toBe('Identifier');
    expect(tree[0].object.value).toBe('cfc');
    expect(tree[0].property.value).toBe('property');
  });

  test('should allow function calls in bracket notation', () => {
    const tree = parse(`cfc.method();`);
    expect(tree[0].type).toBe('MemberExpression');
    expect(tree[0].object.type).toBe('Identifier');
    expect(tree[0].object.value).toBe('cfc');
    expect(tree[0].property.type).toBe('Function');
    expect(tree[0].property.name).toBe('method');
    expect(tree[0].computed).toBe(false);
  });

  test('should allow function calls as object', () => {
    const tree = parse(`generator().method();`);
    expect(tree[0].type).toBe('MemberExpression');
    expect(tree[0].object.type).toBe('Function');
    expect(tree[0].object.name).toBe('generator');
    expect(tree[0].property.type).toBe('Function');
    expect(tree[0].property.name).toBe('method');
  });

  test('should allow member expressions as object', () => {
    const tree = parse(`cfc["property"].method();`);
    expect(tree[0].type).toBe('MemberExpression');
    expect(tree[0].object.type).toBe('MemberExpression');
    expect(tree[0].object.object.value).toBe('cfc');
    expect(tree[0].object.property.value).toBe('property');
    expect(tree[0].object.computed).toBe(true);
    expect(tree[0].property.type).toBe('Function');
    expect(tree[0].property.name).toBe('method');
    expect(tree[0].computed).toBe(false);
  });
});
