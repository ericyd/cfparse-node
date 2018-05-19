const parse = require('../src/parser');

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('tags', () => {
  test('should return a node', () => {
    const tree = parse(`<cfoutput></cfoutput>`);
    expect(tree[0].type).toBe('node');
    expect(tree[0].tag.name).toBe('cfoutput');
  });

  test('should get attributes in single quotes', () => {
    const tree = parse(`<cfoutput prop='val'></cfoutput>`);
    expect(tree[0].type).toBe('node');
    expect(tree[0].tag.name).toBe('cfoutput');
    expect(tree[0].tag.attributes[0].attr).toBe('prop');
    expect(tree[0].tag.attributes[0].value).toBe('val');
  });

  test('should get attributes in double quotes', () => {
    const tree = parse(`<cfoutput prop="val"></cfoutput>`);
    expect(tree[0].type).toBe('node');
    expect(tree[0].tag.name).toBe('cfoutput');
    expect(tree[0].tag.attributes[0].attr).toBe('prop');
    expect(tree[0].tag.attributes[0].value).toBe('val');
  });

  test('should get multiple attributes', () => {
    const tree = parse(`<cfoutput prop1="val1" prop2="val2"></cfoutput>`);
    expect(tree[0].type).toBe('node');
    expect(tree[0].tag.name).toBe('cfoutput');
    expect(tree[0].tag.attributes[0].attr).toBe('prop1');
    expect(tree[0].tag.attributes[0].value).toBe('val1');
    expect(tree[0].tag.attributes[1].attr).toBe('prop2');
    expect(tree[0].tag.attributes[1].value).toBe('val2');
  });

  test('should ignore whitespace in attribute declarations', () => {
    const tree = parse(`<cfoutput prop =	"val"></cfoutput>`);
    expect(tree[0].type).toBe('node');
    expect(tree[0].tag.name).toBe('cfoutput');
    expect(tree[0].tag.attributes[0].attr).toBe('prop');
    expect(tree[0].tag.attributes[0].value).toBe('val');
  });

  test('should ignore line breaks in attribute declarations', () => {
    const tree = parse(`<cfoutput
    prop =
    "val"></cfoutput>`);
    expect(tree[0].type).toBe('node');
    expect(tree[0].tag.name).toBe('cfoutput');
    expect(tree[0].tag.attributes[0].attr).toBe('prop');
    expect(tree[0].tag.attributes[0].value).toBe('val');
  });

  test('should allow any characters in attribute declarations', () => {
    const tree = parse(
      `<cfdiv style="1234567890-=~!@#$%^&*()_+[]{}/|;':,.?"></cfdiv>`
    );
    expect(tree[0].type).toBe('node');
    expect(tree[0].tag.name).toBe('cfdiv');
    expect(tree[0].tag.attributes[0].attr).toBe('style');
    expect(tree[0].tag.attributes[0].value).toBe(
      "1234567890-=~!@#$%^&*()_+[]{}/|;':,.?"
    );
  });

  test('should identify closed nodes without closing slash', () => {
    const tree = parse(`<cfoutput>`);
    expect(tree[0].type).toBe('node');
    expect(tree[0].selfClosed).toBe(true);
    expect(tree[0].tag.name).toBe('cfoutput');
  });

  test('should identify closed nodes with closing slash', () => {
    const tree = parse(`<cfset i = "test" />`);
    expect(tree[0].type).toBe('node');
    expect(tree[0].selfClosed).toBe(true);
    expect(tree[0].tag.name).toBe('cfset');
  });

  test('should identify nested tags', () => {
    const tree = parse(`<cfoutput><cfscript></cfscript></cfoutput>`);
    expect(tree[0].type).toBe('node');
    expect(tree[0].tag.name).toBe('cfoutput');
    expect(tree[0].content[0].tag.name).toBe('cfscript');
  });

  test('should identify closed nested tags', () => {
    const tree = parse(`<cfoutput><cfset var="value" /></cfoutput>`);
    expect(tree[0].type).toBe('node');
    expect(tree[0].tag.name).toBe('cfoutput');
    expect(tree[0].selfClosed).toBe(false);
    expect(tree[0].content[0].tag.name).toBe('cfset');
    expect(tree[0].content[0].selfClosed).toBe(true);
  });

  test('should allow angle brackets in props', () => {
    const tree = parse(`<cfdiv class="<cfif true>active</cfif>"></cfdiv>`);
    expect(tree[0].type).toBe('node');
    expect(tree[0].tag.name).toBe('cfdiv');
    expect(tree[0].tag.attributes[0].attr).toBe('class');
    expect(tree[0].tag.attributes[0].value).toBe('<cfif true>active</cfif>');
  });

  // TODO: this breaks the parser
  test.skip('should allow non-ascii chars in props', () => {
    const tree = parse(`<cfdiv class="√↓►;)┴≡±¡╥-╝åD░║«Y╚á"></cfdiv>`);
    expect(tree[0].type).toBe('node');
    expect(tree[0].tag.name).toBe('cfdiv');
    expect(tree[0].tag.attributes[0].attr).toBe('class');
    expect(tree[0].tag.attributes[0].value).toBe('√↓►;)┴≡±¡╥-╝åD░║«Y╚á');
  });

  // TODO: This returns false, returns a tree != original content
  test.skip('should allow /> in prop', () => {
    const tree = parse(`<cfdiv prop="/>">content</div>`);
    console.log(util.inspect(tree, { depth: null, colors: true }));
    expect(tree[0].type).toBe('node');
    expect(tree[0].tag.name).toBe('cfdiv');
    expect(tree[0].tag.attributes[0].attr).toBe('prop');
    expect(tree[0].tag.attributes[0].value).toBe('/>');
  });

  test.skip('should allow escaped double quotes in props', () => {
    const tree = parse(`<cfdiv prop="test\"something\"">content</div>`);
    console.log(util.inspect(tree, { depth: null, colors: true }));
    expect(tree[0].type).toBe('node');
    expect(tree[0].tag.name).toBe('cfdiv');
    expect(tree[0].tag.attributes[0].attr).toBe('prop');
    expect(tree[0].tag.attributes[0].value).toBe('test"something"');
  });

  test.skip('should allow escaped single quotes in props', () => {
    const tree = parse(`<cfdiv prop='test\'something\''>content</div>`);
    console.log(util.inspect(tree, { depth: null, colors: true }));
    expect(tree[0].type).toBe('node');
    expect(tree[0].tag.name).toBe('cfdiv');
    expect(tree[0].tag.attributes[0].attr).toBe('prop');
    expect(tree[0].tag.attributes[0].value).toBe("test'something'");
  });
});
