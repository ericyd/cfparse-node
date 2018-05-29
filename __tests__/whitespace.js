const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('writespace', () => {
  test('should allow whitespace at beginning of file', () => {
    const string = `    
	  	<cfscript>var i = 0;</cfscript>`;
    expect(() => {
      parse(string);
    }).not.toThrow();
    const tree = parse(string);
    expect(tree.length).toBeGreaterThan(0);
  });

  test('should allow whitespace at end of file', () => {
    const string = `    
	  <cfscript>var i = 0;</cfscript>
	  	`;
    expect(() => {
      parse(string);
    }).not.toThrow();
    const tree = parse(string);
    expect(tree.length).toBeGreaterThan(0);
  });

  test('should allow empty files', () => {
    const string = `    
	
	  	`;
    expect(() => {
      parse(string);
    }).not.toThrow();
    const tree = parse(string);
    expect(tree.length).toBe(0);
  });
});
