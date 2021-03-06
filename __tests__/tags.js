const parser = require('../src/parser'),
    parse = parser.parse;

const util = require('util');
// to inspect a tree:
// console.log(util.inspect(tree, {depth: null, colors: true}))

describe('tags', () => {
  test('should return a tag', () => {
    const tree = parse(`<cfoutput></cfoutput>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfoutput');
  });

  test('should get attributes in single quotes', () => {
    const tree = parse(`<cfoutput prop='val'></cfoutput>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfoutput');
    expect(tree[0].attributes[0].left.value).toBe('prop');
    expect(tree[0].attributes[0].right.value).toBe('val');
  });

  test('should get attributes in double quotes', () => {
    const tree = parse(`<cfoutput prop="val"></cfoutput>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfoutput');
    expect(tree[0].attributes[0].left.value).toBe('prop');
    expect(tree[0].attributes[0].right.value).toBe('val');
  });

  test('should get multiple attributes', () => {
    const tree = parse(`<cfoutput prop1="val1" prop2="val2"></cfoutput>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfoutput');
    expect(tree[0].attributes[0].left.value).toBe('prop1');
    expect(tree[0].attributes[0].right.value).toBe('val1');
    expect(tree[0].attributes[1].left.value).toBe('prop2');
    expect(tree[0].attributes[1].right.value).toBe('val2');
  });

  test('should ignore whitespace in attribute declarations', () => {
    const tree = parse(`<cfoutput prop =	"val"></cfoutput>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfoutput');
    expect(tree[0].attributes[0].left.value).toBe('prop');
    expect(tree[0].attributes[0].right.value).toBe('val');
  });

  test('should ignore line breaks in attribute declarations', () => {
    const tree = parse(`<cfoutput
    prop =
    "val"></cfoutput>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfoutput');
    expect(tree[0].attributes[0].left.value).toBe('prop');
    expect(tree[0].attributes[0].right.value).toBe('val');
  });

  test('should allow any characters in attribute declarations', () => {
    const tree = parse(
      `<cfdiv style="1234567890-=~!@#$%^&*()_+[]{}/|;':,.?"></cfdiv>`
    );
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfdiv');
    expect(tree[0].attributes[0].left.value).toBe('style');
    expect(tree[0].attributes[0].right.value).toBe(
      "1234567890-=~!@#$%^&*()_+[]{}/|;':,.?"
    );
  });

  test('should identify closed nodes without closing slash', () => {
    const tree = parse(`<cfoutput>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].balanced).toBe(false);
    expect(tree[0].name).toBe('cfoutput');
  });

  test('should identify closed nodes with closing slash', () => {
    const tree = parse(`<cfset i = "test" />`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].balanced).toBe(false);
    expect(tree[0].name).toBe('cfset');
  });

  test('should identify nested tags', () => {
    const tree = parse(`<cfoutput><cfscript></cfscript></cfoutput>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfoutput');
    expect(tree[0].body[0].name).toBe('cfscript');
  });

  test('should identify closed nested tags', () => {
    const tree = parse(`<cfoutput><cfset myVar="value" /></cfoutput>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfoutput');
    expect(tree[0].balanced).toBe(true);
    expect(tree[0].body[0].name).toBe('cfset');
    expect(tree[0].body[0].balanced).toBe(false);
  });

  test('should allow angle brackets in props', () => {
    const tree = parse(`<cfdiv class="<cfif true>active</cfif>"></cfdiv>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfdiv');
    expect(tree[0].attributes[0].left.value).toBe('class');
    expect(tree[0].attributes[0].right.value).toBe('<cfif true>active</cfif>');
  });

  test('should allow non-ascii chars in props', () => {
    const tree = parse(`<cfdiv class="√↓►;)┴≡±¡╥-╝åD░║«Y╚á"></cfdiv>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfdiv');
    expect(tree[0].attributes[0].left.value).toBe('class');
    expect(tree[0].attributes[0].right.value).toBe('√↓►;)┴≡±¡╥-╝åD░║«Y╚á');
  });

  test('should allow /> in prop', () => {
    const tree = parse(`<cfdiv prop="/>">body</div>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfdiv');
    expect(tree[0].attributes[0].left.value).toBe('prop');
    expect(tree[0].attributes[0].right.value).toBe('/>');
  });

  test('should allow escaped double quotes in props', () => {
    const tree = parse(`<cfdiv prop="test\\"something\\"">body</div>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfdiv');
    expect(tree[0].attributes[0].left.value).toBe('prop');
    expect(tree[0].attributes[0].right.value).toBe('test"something"');
  });

  test('should allow escaped single quotes in props', () => {
    const tree = parse(`<cfdiv prop='test\\'something\\''>body</div>`);
    expect(tree[0].type).toBe('Tag');
    expect(tree[0].name).toBe('cfdiv');
    expect(tree[0].attributes[0].left.value).toBe('prop');
    expect(tree[0].attributes[0].right.value).toBe("test'something'");
  });
});
