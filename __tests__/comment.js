/*
Comments can exist anywhere and should be treated as pre-formatted text.
No modifications to the bodys or formatting of the comment
*/

const parser = require('../src/parser'),
    parse = parser.parse;

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('tag context comments', () => {
  test('should return a comment', () => {
    const tree = parse(`<!--- test --->`);
    expect(tree[0].type).toBe('Comment');
    expect(tree[0].tagContext).toBe(true);
    expect(tree[0].body).toBe(' test ');
    expect(tree[0].singleLine).toBe(true);
  });

  test('should allow multi-line comments', () => {
    const tree = parse(`<!---
    test
    --->`);
    expect(tree[0].type).toBe('Comment');
    expect(tree[0].tagContext).toBe(true);
    expect(tree[0].body).toContain('test');
    expect(tree[0].singleLine).toBe(false);
  });

  test('should allow no whitespace comments', () => {
    const tree = parse(`<!---test--->`);
    expect(tree[0].type).toBe('Comment');
    expect(tree[0].tagContext).toBe(true);
    expect(tree[0].body).toBe('test');
    expect(tree[0].singleLine).toBe(true);
  });

  test('should allow tags in comments', () => {
    const tree = parse(`<!---
    Example: <cfset exampleVar = "exampleValue" />
    --->`);
    expect(tree[0].type).toBe('Comment');
    expect(tree[0].tagContext).toBe(true);
    expect(tree[0].body).toContain(
      'Example: <cfset exampleVar = "exampleValue" />'
    );
    expect(tree[0].singleLine).toBe(false);
  });

  test('should allow empty comments', () => {
    const tree = parse(`<!------>`);
    expect(tree[0].type).toBe('Comment');
    expect(tree[0].tagContext).toBe(true);
    expect(tree[0].body).toBe('');
    expect(tree[0].singleLine).toBe(true);
  });

  test('should allow empty comments with whitespace', () => {
    const tree = parse(`<!--- 	 --->`);
    expect(tree[0].type).toBe('Comment');
    expect(tree[0].tagContext).toBe(true);
    expect(tree[0].body).toBe(' \t ');
    expect(tree[0].singleLine).toBe(true);
  });

  test('should allow fenced comments', () => {
    const tree = parse(`<!--------------------------------
    sometimes used in heading
    ----------------------------->`);
    expect(tree[0].type).toBe('Comment');
    expect(tree[0].tagContext).toBe(true);
    expect(tree[0].body).toContain('sometimes used in heading');
    expect(tree[0].singleLine).toBe(false);
  });

  test('should throw on nested comments', () => {
    expect(() => {
      parse(`<!--- <!--- comment in a comment ---> --->`);
    }).toThrow();
  });
});

describe('script context comments', () => {
  test('should allow script style line comments', () => {
    const tree = parse(`// test`);
    expect(tree[0].type).toBe('Comment');
    expect(tree[0].tagContext).toBe(false);
    expect(tree[0].body).toBe(' test');
  });

  test('line comments should end at line break', () => {
    const tree = parse(`// test
    callMe();`);
    expect(tree[0].type).toBe('Comment');
    expect(tree[0].tagContext).toBe(false);
    expect(tree[0].body).toBe(' test');
  });

  test('should allow no characters in body', () => {
    const tree = parse(`//`);
    expect(tree[0].type).toBe('Comment');
    expect(tree[0].tagContext).toBe(false);
    expect(tree[0].body).toBe('');
  });

  test('should allow script style block comments', () => {
    const tree = parse(`/* testing */`);
    expect(tree[0].type).toBe('Comment');
    expect(tree[0].tagContext).toBe(false);
    expect(tree[0].body).toBe(' testing ');
  });

  test('should allow empty script style block comments', () => {
    const tree = parse(`/* */`);
    expect(tree[0].type).toBe('Comment');
    expect(tree[0].tagContext).toBe(false);
    expect(tree[0].body).toBe(' ');
  });

  test('should allow arbitrary whitespace in script style block comments', () => {
    const tree = parse(`/* 
    * test1
    * test2
    */`);
    expect(tree[0].type).toBe('Comment');
    expect(tree[0].tagContext).toBe(false);
    expect(tree[0].body).toBe(` 
    * test1
    * test2
    `);
  });

  test('should throw on nested comments', () => {
    expect(() => {
      parse(`/* /* test */ */`);
    }).toThrow();
  });
});
