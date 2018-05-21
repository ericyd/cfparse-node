/*
Comments can exist anywhere and should be treated as pre-formatted text.
No modifications to the contents or formatting of the comment
*/

const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('comments', () => {
  test('should return a comment', () => {
    const tree = parse(`<!--- test --->`);
    expect(tree[0].type).toBe('comment');
    expect(tree[0].content).toBe(' test ');
    expect(tree[0].singleLine).toBe(true);
  });

  test('should allow multi-line comments', () => {
    const tree = parse(`<!---
    test
    --->`);
    expect(tree[0].type).toBe('comment');
    expect(tree[0].content).toContain('test');
    expect(tree[0].singleLine).toBe(false);
  });

  test('should allow no whitespace comments', () => {
    const tree = parse(`<!---test--->`);
    expect(tree[0].type).toBe('comment');
    expect(tree[0].content).toBe('test');
    expect(tree[0].singleLine).toBe(true);
  });

  test('should allow tags in comments', () => {
    const tree = parse(`<!---
    Example: <cfset exampleVar = "exampleValue" />
    --->`);
    expect(tree[0].type).toBe('comment');
    expect(tree[0].content).toContain(
      'Example: <cfset exampleVar = "exampleValue" />'
    );
    expect(tree[0].singleLine).toBe(false);
  });

  test('should allow empty comments', () => {
    const tree = parse(`<!------>`);
    expect(tree[0].type).toBe('comment');
    expect(tree[0].content).toBe('');
    expect(tree[0].singleLine).toBe(true);
  });

  test('should allow empty comments with whitespace', () => {
    const tree = parse(`<!--- 	 --->`);
    expect(tree[0].type).toBe('comment');
    expect(tree[0].content).toBe(' \t ');
    expect(tree[0].singleLine).toBe(true);
  });

  test('should allow fenced comments', () => {
    const tree = parse(`<!--------------------------------
    sometimes used in heading
    ----------------------------->`);
    expect(tree[0].type).toBe('comment');
    expect(tree[0].content).toContain('sometimes used in heading');
    expect(tree[0].singleLine).toBe(false);
  });

  // TODO: this should be supported, though currently fails to parse so at least not losing data
  test('should allow nested comments', () => {
    const tree = parse(`<!--- <!--- comment in a comment ---> --->`);
    expect(tree[0].type).toBe('comment');
    expect(tree[0].content).toBe(' <!--- comment in a comment ---> ');
    expect(tree[0].singleLine).toBe(true);
  });
});
