const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('functions', () => {
  test('should identify evaluated functions', () => {
    const tree = parse(`#myFunc()#`);
    expect(tree[0].type).toBe('function');
    expect(tree[0].name).toBe('myFunc');
    expect(tree[0].args.length).toBe(0);
    expect(tree[0].useNumberSign).toBe(true);
  });

  test('should identify non-evaluated functions', () => {
    const tree = parse(`myFunc()`);
    expect(tree[0].type).toBe('function');
    expect(tree[0].name).toBe('myFunc');
    expect(tree[0].args.length).toBe(0);
    expect(tree[0].useNumberSign).toBe(false);
  });

  // TODO: is this a requirement that it throw? might just return false, which should be OK
  test.skip('should throw on unmatches hashtags', () => {
    expect(() => {
      parse(`#myFunc()`);
    }).toThrow();
    expect(() => {
      parse(`myFunc()#`);
    }).toThrow();
  });

  test('should allow whitespace between parens', () => {
    const tree = parse(`myFunc(   			  
      			 
    )`);
    expect(tree[0].type).toBe('function');
    expect(tree[0].name).toBe('myFunc');
    expect(tree[0].args.length).toBe(0);
  });

  test('should allow single whitespace before parens', () => {
    const tree = parse(`myFunc ()`);
    expect(tree[0].type).toBe('function');
    expect(tree[0].name).toBe('myFunc');
    expect(tree[0].args.length).toBe(0);
  });

  test('should allow single argument', () => {
    const tree = parse(`myFunc ( test )`);
    expect(tree[0].type).toBe('function');
    expect(tree[0].name).toBe('myFunc');
    expect(tree[0].args[0].value.value).toBe('test');
  });

  test('should allow multiple arguments', () => {
    const tree = parse(`myFunc ( test1, test2 )`);
    expect(tree[0].type).toBe('function');
    expect(tree[0].name).toBe('myFunc');
    expect(tree[0].args[0].value.value).toBe('test1');
    expect(tree[0].args[1].value.value).toBe('test2');
  });

  test('should allow string as argument', () => {
    const tree = parse(`myFunc("testString")`);
    expect(tree[0].type).toBe('function');
    expect(tree[0].name).toBe('myFunc');
    expect(tree[0].args[0].value.value).toBe('testString');
  });

  test('should allow array as argument', () => {
    const tree = parse(`myFunc([1, 2, 3])`);
    expect(tree[0].type).toBe('function');
    expect(tree[0].name).toBe('myFunc');
    expect(tree[0].args[0].value.elements[0].value).toBe('1');
    expect(tree[0].args[0].value.elements[1].value).toBe('2');
    expect(tree[0].args[0].value.elements[2].value).toBe('3');
  });

  test('should allow struct as argument', () => {
    const tree = parse(`myFunc({test: myTest})`);
    expect(tree[0].type).toBe('function');
    expect(tree[0].name).toBe('myFunc');
    expect(tree[0].args[0].value.properties[0].key.value).toBe('test');
    expect(tree[0].args[0].value.properties[0].value.value).toBe('myTest');
  });

  test('should allow named arguments', () => {
    const tree = parse(`myFunc(arg1 = "yay", arg2 ="woohoo")`);
    expect(tree[0].type).toBe('function');
    expect(tree[0].name).toBe('myFunc');
    expect(tree[0].args[0].arg.value).toBe('arg1');
    expect(tree[0].args[0].value.value).toBe('yay');
    expect(tree[0].args[1].arg.value).toBe('arg2');
    expect(tree[0].args[1].value.value).toBe('woohoo');
  });

  test('should allow quoted named arguments', () => {
    const tree = parse(`myFunc("arg1"='yay', 'arg2'= "woohoo")`);
    expect(tree[0].type).toBe('function');
    expect(tree[0].name).toBe('myFunc');
    expect(tree[0].args[0].arg.value).toBe('arg1');
    expect(tree[0].args[0].value.value).toBe('yay');
    expect(tree[0].args[1].arg.value).toBe('arg2');
    expect(tree[0].args[1].value.value).toBe('woohoo');
  });

  test('should not allow trailing comma in arguments list', () => {
    expect(() => {
      parse(`myFunc("arg1"='yay', 'arg2'= "woohoo", )`);
    }).toThrow();
  });
});
