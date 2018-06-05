const parser = require('../src/parser'),
    parse = parser.parse;

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('member expressions', () => {
  test('should identify dot operator', () => {
    const tree = parse(`cfc.property;`);
    expect(tree[0].expression.type).toBe('MemberExpression');
    expect(tree[0].expression.object.type).toBe('Identifier');
    expect(tree[0].expression.object.value).toBe('cfc');
    expect(tree[0].expression.property.value).toBe('property');
    expect(tree[0].expression.computed).toBe(false);
  });

  test('should identify bracket operator', () => {
    const tree = parse(`cfc[property];`);
    expect(tree[0].expression.type).toBe('MemberExpression');
    expect(tree[0].expression.object.type).toBe('Identifier');
    expect(tree[0].expression.object.value).toBe('cfc');
    expect(tree[0].expression.property.value).toBe('property');
    expect(tree[0].expression.computed).toBe(true);
  });

  test('should allow strings in bracket notation', () => {
    const tree = parse(`cfc["property"];`);
    expect(tree[0].expression.type).toBe('MemberExpression');
    expect(tree[0].expression.object.type).toBe('Identifier');
    expect(tree[0].expression.object.value).toBe('cfc');
    expect(tree[0].expression.property.value).toBe('property');
    expect(tree[0].expression.computed).toBe(true);
  });

  test('should allow function calls in bracket notation', () => {
    const tree = parse(`cfc[method()];`);
    expect(tree[0].expression.type).toBe('MemberExpression');
    expect(tree[0].expression.object.type).toBe('Identifier');
    expect(tree[0].expression.object.value).toBe('cfc');
    expect(tree[0].expression.property.type).toBe('CallExpression');
    expect(tree[0].expression.property.callee.value).toBe('method');
    expect(tree[0].expression.computed).toBe(true);
  });

  test('should allow arbitrary whitespace in bracket notation', () => {
    const tree = parse(`cfc 
    	[ property	
		 ];`);
    expect(tree[0].expression.type).toBe('MemberExpression');
    expect(tree[0].expression.object.type).toBe('Identifier');
    expect(tree[0].expression.object.value).toBe('cfc');
    expect(tree[0].expression.property.value).toBe('property');
    expect(tree[0].expression.computed).toBe(true);
  });

  test('should allow arbitrary whitespace in dot notation', () => {
    const tree = parse(`cfc 
		. 
    	property;`);
    expect(tree[0].expression.type).toBe('MemberExpression');
    expect(tree[0].expression.object.type).toBe('Identifier');
    expect(tree[0].expression.object.value).toBe('cfc');
    expect(tree[0].expression.property.value).toBe('property');
  });

  test('should allow function calls in bracket notation', () => {
    const tree = parse(`cfc.method();`);
    expect(tree[0].expression.callee.type).toBe('MemberExpression');
    expect(tree[0].expression.callee.object.type).toBe('Identifier');
    expect(tree[0].expression.callee.object.value).toBe('cfc');
    expect(tree[0].expression.callee.property.type).toBe('Identifier');
    expect(tree[0].expression.callee.property.value).toBe('method');
    expect(tree[0].expression.callee.computed).toBe(false);
  });

  test('should allow function calls as object', () => {
    const tree = parse(`generator().method();`);
    expect(tree[0].expression.callee.type).toBe('MemberExpression');
    expect(tree[0].expression.callee.object.type).toBe('CallExpression');
    expect(tree[0].expression.callee.object.callee.value).toBe('generator');
    expect(tree[0].expression.callee.property.type).toBe('Identifier');
    expect(tree[0].expression.callee.property.value).toBe('method');
  });

  test('should allow member expressions as object', () => {
    const tree = parse(`cfc["property"].method();`);
    expect(tree[0].expression.callee.type).toBe('MemberExpression');
    expect(tree[0].expression.callee.object.type).toBe('MemberExpression');
    expect(tree[0].expression.callee.object.object.value).toBe('cfc');
    expect(tree[0].expression.callee.object.property.value).toBe('property');
    expect(tree[0].expression.callee.object.computed).toBe(true);
    expect(tree[0].expression.callee.property.type).toBe('Identifier');
    expect(tree[0].expression.callee.property.value).toBe('method');
    expect(tree[0].expression.callee.computed).toBe(false);
  });
});
