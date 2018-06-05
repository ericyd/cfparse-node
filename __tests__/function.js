const parser = require('../src/parser'),
    parse = parser.parse;

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('call expressions', () => {
  test('should identify evaluated functions', () => {
    const tree = parse(`#myFunc()#;`);
    expect(tree[0].type).toBe('Function');
    expect(tree[0].callee.value).toBe('myFunc');
    expect(tree[0].arguments.length).toBe(0);
    expect(tree[0].useNumberSign).toBe(true);
  });

  test('should identify non-evaluated functions', () => {
    const tree = parse(`myFunc();`);
    expect(tree[0].expression.type).toBe('CallExpression');
    expect(tree[0].expression.callee.value).toBe('myFunc');
    expect(tree[0].expression.arguments.length).toBe(0);
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
      			 
    );`);
    expect(tree[0].expression.type).toBe('CallExpression');
    expect(tree[0].expression.callee.value).toBe('myFunc');
    expect(tree[0].expression.arguments.length).toBe(0);
  });

  test('should allow single whitespace before parens', () => {
    const tree = parse(`myFunc ();`);
    expect(tree[0].expression.type).toBe('CallExpression');
    expect(tree[0].expression.callee.value).toBe('myFunc');
    expect(tree[0].expression.arguments.length).toBe(0);
  });

  test('should allow single argument', () => {
    const tree = parse(`myFunc ( test );`);
    expect(tree[0].expression.type).toBe('CallExpression');
    expect(tree[0].expression.callee.value).toBe('myFunc');
    expect(tree[0].expression.arguments[0].value).toBe('test');
  });

  test('should allow multiple arguments', () => {
    const tree = parse(`myFunc ( test1, test2 );`);
    expect(tree[0].expression.type).toBe('CallExpression');
    expect(tree[0].expression.callee.value).toBe('myFunc');
    expect(tree[0].expression.arguments[0].value).toBe('test1');
    expect(tree[0].expression.arguments[1].value).toBe('test2');
  });

  test('should allow string as argument', () => {
    const tree = parse(`myFunc("testString");`);
    expect(tree[0].expression.type).toBe('CallExpression');
    expect(tree[0].expression.callee.value).toBe('myFunc');
    expect(tree[0].expression.arguments[0].value).toBe('testString');
  });

  test('should allow array as argument', () => {
    const tree = parse(`myFunc([1, 2, 3]);`);
    expect(tree[0].expression.type).toBe('CallExpression');
    expect(tree[0].expression.callee.value).toBe('myFunc');
    expect(tree[0].expression.arguments[0].elements[0].value).toBe(1);
    expect(tree[0].expression.arguments[0].elements[1].value).toBe(2);
    expect(tree[0].expression.arguments[0].elements[2].value).toBe(3);
  });

  test('should allow struct as argument', () => {
    const tree = parse(`myFunc({test: myTest});`);
    expect(tree[0].expression.type).toBe('CallExpression');
    expect(tree[0].expression.callee.value).toBe('myFunc');
    expect(tree[0].expression.arguments[0].properties[0].key.value).toBe('test');
    expect(tree[0].expression.arguments[0].properties[0].value.value).toBe('myTest');
  });

  test('should allow named arguments', () => {
    const tree = parse(`myFunc(arg1 = "yay", arg2 ="woohoo");`);
    expect(tree[0].expression.type).toBe('CallExpression');
    expect(tree[0].expression.callee.value).toBe('myFunc');
    expect(tree[0].expression.arguments[0].left.value).toBe('arg1');
    expect(tree[0].expression.arguments[0].left.type).toBe('Identifier');
    expect(tree[0].expression.arguments[0].right.value).toBe('yay');
    expect(tree[0].expression.arguments[1].left.value).toBe('arg2');
    expect(tree[0].expression.arguments[1].left.type).toBe('Identifier');
    expect(tree[0].expression.arguments[1].right.value).toBe('woohoo');
  });

  test('should allow quoted named arguments', () => {
    const tree = parse(`myFunc("arg1"='yay', 'arg2'= "woohoo");`);
    expect(tree[0].expression.type).toBe('CallExpression');
    expect(tree[0].expression.callee.value).toBe('myFunc');
    expect(tree[0].expression.arguments[0].left.value).toBe('arg1');
    expect(tree[0].expression.arguments[0].left.type).toBe('String');
    expect(tree[0].expression.arguments[0].right.value).toBe('yay');
    expect(tree[0].expression.arguments[1].left.value).toBe('arg2');
    expect(tree[0].expression.arguments[1].left.type).toBe('String');
    expect(tree[0].expression.arguments[1].right.value).toBe('woohoo');
  });

  test('should not allow trailing comma in arguments list', () => {
    expect(() => {
      parse(`myFunc("arg1"='yay', 'arg2'= "woohoo", )`);
    }).toThrow();
  });
});

describe('function declarations and expressions', () => {
  test('should identify function declaration', () => {
    const tree = parse(`function id() {}`);
    expect(tree[0].type).toBe('FunctionDeclaration');
    expect(tree[0].name).toBe('id');
  });

  test('should identify function declaration with param', () => {
    const tree = parse(`function id(param1) {}`);
    expect(tree[0].type).toBe('FunctionDeclaration');
    expect(tree[0].name).toBe('id');
    expect(tree[0].params.length).toBe(1);
  });

  test('should allow accessType before function keyword', () => {
    const tree = parse(`private function id() {}`);
    // console.log(util.inspect(tree, {depth: null, colors: true}));
    expect(tree[0].type).toBe('FunctionDeclaration');
    expect(tree[0].accessType).toBe('private');
    expect(tree[0].name).toBe('id');
  });

  test('should allow returnType before function keyword', () => {
    const tree = parse(`string function id() {}`);
    expect(tree[0].type).toBe('FunctionDeclaration');
    // console.log(util.inspect(tree, {depth: null, colors: true}));
    expect(tree[0].returnType).toBe('string');
    expect(tree[0].name).toBe('id');
  });

  test('should allow accessType and returnType before function keyword', () => {
    const tree = parse(`remote string function id() {}`);
    expect(tree[0].type).toBe('FunctionDeclaration');
    expect(tree[0].returnType).toBe('string');
    expect(tree[0].accessType).toBe('remote');
    expect(tree[0].name).toBe('id');
  });

  test('should not allow different keyword order before function keyword', () => {
    expect(() => {
      parse(`string remote function id() {}`)
    }).toThrow();
  });

  test('should allow single attribute after function params', () => {
    const tree = parse(`function mxunitTest() order="1" {}`);
    expect(tree[0].type).toBe('FunctionDeclaration');
    expect(tree[0].attributes[0].attr.value).toBe('order');
    expect(tree[0].attributes[0].value.value).toBe('1');
  });

  test('should allow multiple attributes after function params', () => {
    const tree = parse(
      `function mxunitTest() displayName="test" hint="myHint" {}`
    );
    expect(tree[0].type).toBe('FunctionDeclaration');
    expect(tree[0].attributes.length).toBe(2);
  });

  test('should allow keywords before params', () => {
    const tree = parse(`function test(required numeric param1) {}`);
    expect(tree[0].type).toBe('FunctionDeclaration');
    expect(tree[0].params.length).toBe(1);
    expect(tree[0].params[0].required).toBe(true);
    expect(tree[0].params[0].dataType).toBe('numeric');
    expect(tree[0].params[0].name).toBe('param1');
  });

  test('should allow multiple params', () => {
    const tree = parse(
      `function test(required numeric param1, param2, string param3) {}`
    );
    expect(tree[0].type).toBe('FunctionDeclaration');
    expect(tree[0].params.length).toBe(3);
    expect(tree[0].params[0].name).toBe('param1');
    expect(tree[0].params[0].dataType).toBe('numeric');
    expect(tree[0].params[0].required).toBe(true);
    expect(tree[0].params[1].name).toBe('param2');
    expect(tree[0].params[1].required).toBe(false);
    expect(tree[0].params[1].dataType).toBe(null);
    expect(tree[0].params[2].name).toBe('param3');
    expect(tree[0].params[2].dataType).toBe('string');
    expect(tree[0].params[2].required).toBe(false);
  });

  test('should allow default values for params', () => {
    const tree = parse(`function test(required numeric param1 = 3) {}`);
    expect(tree[0].type).toBe('FunctionDeclaration');
    expect(tree[0].params[0].default.value).toBe(3);
  });

  test('should allow any expression as default values for params', () => {
    expect(() => {
      parse(`function test(param1 = 3) {}`);
    }).not.toThrow();
    expect(() => {
      parse(`function test(param1 = test()) {}`);
    }).not.toThrow();
    expect(() => {
      parse(`function test(param1 = [1, 2, 3]) {}`);
    }).not.toThrow();
    expect(() => {
      parse(`function test(param1 = {id: "test"}) {}`);
    }).not.toThrow();
    expect(() => {
      parse(`function test(param1 = string) {}`);
    }).not.toThrow();
  });

  test('should not allow trailing comma after params', () => {
    expect(() => {
      parse(`function test(param1, ) {}`);
    }).toThrow();
  });

  // this is getting parsed as something other than a function - should throw an error
  test('should not allow param to be named a reserved keyword', () => {
    expect(() => {
      parse(`function test(test, required) {}`);
    }).toThrow();
    // const tree = parse(`function test(test, required) {}`);
    // console.log(util.inspect(tree, {depth: null, colors: true}))
  });

  test('should allow omitted identifier', () => {
    const tree = parse(`function (required numeric param1 = 3) {}`);
    expect(tree[0].type).toBe('FunctionDeclaration');
    expect(tree[0].params[0].name).toBe('param1');
  });

  // TODO: the default is getting wrapped into a "sequence expression" so param2 is never identified
  test('should allow arbitrary whitespace identifier', () => {
    const tree = parse(`function 
      test
      (
        required numeric param1 = 3
      ,
    param2
  )
   {

  }`);
  // console.log(util.inspect(tree, {depth: null, colors: true}))
    expect(tree[0].type).toBe('FunctionDeclaration');
    expect(tree[0].name).toBe('test');
    expect(tree[0].params[0].name).toBe('param1');
    expect(tree[0].params[1].name).toBe('param2');
  });

  test('need to write tests for body', () => {
    expect(true).toBe(false);
  });
});
