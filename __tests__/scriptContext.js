const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('script context', () => {
  test('should identify script context', () => {
    const tree = parse(`<cfscript>var i = 0;</cfscript>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfscript');
    expect(tree[0].body[0].type).toBe('Script');
  });
});
