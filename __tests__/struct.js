const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('struct', () => {
  test('should allow non-quoted keys', () => {
    const tree = parse(`{ key : "value" }`);
    expect(tree[0].type).toBe('struct');
    expect(tree[0].properties[0].key.value).toBe('key');
    expect(tree[0].properties[0].value.value).toBe('value');
  });

  test('should allow quoted keys', () => {
    const tree = parse(`{ "key" : "value" }`);
    expect(tree[0].type).toBe('struct');
    expect(tree[0].properties[0].key.value).toBe('key');
    expect(tree[0].properties[0].value.value).toBe('value');
  });

  test('should allow `=` as key/value delimiter', () => {
    const tree = parse(`{ "key" = "value" }`);
    expect(tree[0].type).toBe('struct');
    expect(tree[0].properties[0].key.value).toBe('key');
    expect(tree[0].properties[0].value.value).toBe('value');
  });

  test('should allow `:` as key/value delimiter', () => {
    const tree = parse(`{test: "test"}`);
    expect(tree[0].type).toBe('struct');
    expect(tree[0].properties[0].key.value).toBe('test');
    expect(tree[0].properties[0].value.value).toBe('test');
  });

  test('should capture multiple comma-delimited key/value pairs', () => {
    const tree = parse(`{key1: "value1" , key2: "value2"}`);
    expect(tree[0].type).toBe('struct');
    expect(tree[0].properties[0].key.value).toBe('key1');
    expect(tree[0].properties[0].value.value).toBe('value1');
    expect(tree[0].properties[1].key.value).toBe('key2');
    expect(tree[0].properties[1].value.value).toBe('value2');
  });

  test('should allow any amount of whitespace between tokens', () => {
    const tree = parse(`{
         key1:
         "value1"					
         ,
         key2					:
      					 
         "value2"
      }`);
    expect(tree[0].type).toBe('struct');
    expect(tree[0].properties[0].key.value).toBe('key1');
    expect(tree[0].properties[0].value.value).toBe('value1');
    expect(tree[0].properties[1].key.value).toBe('key2');
    expect(tree[0].properties[1].value.value).toBe('value2');
  });

  test('should allow identifiers as value', () => {
    const tree = parse(`{test: testing}`);
    expect(tree[0].type).toBe('struct');
    expect(tree[0].properties[0].key.value).toBe('test');
    expect(tree[0].properties[0].value.type).toBe('identifier');
    expect(tree[0].properties[0].value.value).toBe('testing');
  });

  test('should allow functions as value', () => {
    const tree = parse(`{test: testing()}`);
    expect(tree[0].type).toBe('struct');
    expect(tree[0].properties[0].key.value).toBe('test');
    expect(tree[0].properties[0].value.type).toBe('function');
    expect(tree[0].properties[0].value.name).toBe('testing');
  });

  test('should allow structs as value', () => {
    const tree = parse(`{
      test: {
        id: 1
      }
    }`);
    expect(tree[0].type).toBe('struct');
    expect(tree[0].properties[0].key.value).toBe('test');
    expect(tree[0].properties[0].value.type).toBe('struct');
    expect(tree[0].properties[0].value.properties[0].key.value).toBe('id');
  });

  test('should allow arrays as value', () => {
    const tree = parse(`{test: [1, 2, 3] }`);
    expect(tree[0].type).toBe('struct');
    expect(tree[0].properties[0].key.value).toBe('test');
    expect(tree[0].properties[0].value.type).toBe('array');
    expect(tree[0].properties[0].value.elements[0].value).toBe('1');
  });

  test('should not allow functions as keys', () => {
    expect(() => {
      parse(`{testing() : test}`);
    }).toThrow();
  });

  test('should not allow struct as keys', () => {
    expect(() => {
      parse(`{ {test: test} : test}`);
    }).toThrow();
  });

  test('should not allow array as keys', () => {
    expect(() => {
      parse(`{ [1,2,3] : test}`);
    }).toThrow();
  });

  test('should not allow tags as keys', () => {
    expect(() => {
      parse(`{ <cfset i = 0 /> : test}`);
    }).toThrow();
  });

  test('should not allow keys without values', () => {
    expect(() => {
      parse(`{ test }`);
    }).toThrow();
  });

  test('should not allow key/value pairs without comma delimiters', () => {
    // TODO: this passes because commas are optional in the parsing grammar.
    // need to determine if there is a way to only make them optional for the final pair
    expect(() => {
      parse(`{ test: testing code: coding }`);
    }).toThrow();
  });

  test('should not allow alternative delimiters', () => {
    expect(() => {
      parse(`{ test: testing ; code: coding }`);
    }).toThrow();
    expect(() => {
      parse(`{ test: testing | code: coding }`);
    }).toThrow();
  });

  test('should not allow comma after last key/value pair', () => {
    expect(() => {
      parse(`{test: "test" , }`);
    }).toThrow();
  });

  test('should allow empty struct literals', () => {
    const tree = parse(`{}`);
    expect(tree[0].type).toBe('struct');
    expect(tree[0].properties.length).toBe(0);
    const tree2 = parse(`{   }`);
    expect(tree2[0].type).toBe('struct');
    expect(tree2[0].properties.length).toBe(0);
  });
});
