const parser = require('../src/parser'),
    parse = parser.parse;

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('attributs', () => {
  test('should allow props without values', () => {
    const tree = parse(`<option disabled></option>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('option');
    expect(tree[0].attributes[0].value).toBe('disabled');
  });

  test('should allow function calls as attributes', () => {
    const tree = parse(`<cfset myFunction() />`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfset');
    expect(tree[0].attributes[0].callee.value).toBe('myFunction');
  });

  test('should allow function calls as attribute values', () => {
    const tree = parse(`<cfset myVar = myFunction() />`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfset');
    expect(tree[0].attributes[0].left.value).toBe('myVar');
    expect(tree[0].attributes[0].right.callee.value).toBe('myFunction');
  });

  test('should allow boolean operators', () => {
    const tree = parse(`<cfif 1 NEQ 2><cfset i = '0' /></cfif>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfif');
    expect(tree[0].attributes[0].left.value).toBe(1);
    expect(tree[0].attributes[0].right.value).toBe(2);
    expect(tree[0].attributes[0].operator).toBe("NEQ");
  });

  test('should allow struct literals as values', () => {
    const tree = parse(`<cfdump myVar = { test: 'testval' } />`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfdump');
    expect(tree[0].attributes[0].left.value).toBe('myVar');
    expect(tree[0].attributes[0].right.properties[0].key.value).toBe('test');
    expect(tree[0].attributes[0].right.properties[0].value.value).toBe(
      'testval'
    );
  });

  test('should allow array literals as values', () => {
    const tree = parse(`<cfdump myVar = ['one'] />`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfdump');
    expect(tree[0].attributes[0].left.value).toBe('myVar');
    expect(tree[0].attributes[0].right.elements[0].value).toBe('one');
  });

  test('should allow number literals as values', () => {
    const tree = parse(`<cfdump myVar = 0 />`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfdump');
    expect(tree[0].attributes[0].left.value).toBe('myVar');
    expect(tree[0].attributes[0].right.value).toBe(0);
  });

  // TODO: Need to add "number sign" literals as parsing rule
  test('should accept deferenced identifiers as values', () => {
    const tree = parse(`<cfdump myVar = #myVar# />`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfdump');
    expect(tree[0].attributes[0].attr.value).toBe('myVar');
    expect(tree[0].attributes[0].value.value).toBe('myVar');
    expect(tree[0].attributes[0].value.useNumberSign).toBe(true);
  });
});
