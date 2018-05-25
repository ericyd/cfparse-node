// Parsing grammar for ColdFusion language,
// powered by PEG.js [1]
//
// Credit is due to several sources, including:
// * David Luecke's Medium article [2]
// * JavaScript example grammar (PEG.js) [3]
// * JSON example grammar (PEG.js) [4]
//
// All three of these have snippets that have been included in this grammar
// with minor revisions due to syntactic differences or author preferences.
//
// [1] https://pegjs.org/
// [2] https://medium.com/@daffl/beyond-regex-writing-a-parser-in-javascript-8c9ed10576a6
// [3] https://github.com/pegjs/pegjs/blob/35f3c5267a062646c8f5762af37f31c5443f0696/examples/javascript.pegjs
// [4] https://github.com/pegjs/pegjs/blob/35f3c5267a062646c8f5762af37f31c5443f0696/examples/json.pegjs



{
  // function extractOptional(optional, index) {
  //   return optional ? optional[index] : null;
  // }

  // function extractList(list, index) {
  //   return list.map(function(element) { return element[index]; });
  // }

  // this was from javascript.pegjs
  // personally I think it's easier to explicitly return the item you want
  // in the property definition
  // this is used to match things like (ws "," ws something) and extract the "something"
  // I prefer to write (ws "," ws s:something {return s;})
  // function buildList(head, tail, index) {
  //   return [head].concat(extractList(tail, index));
  // }

  function buildList(head, tail) {
    return [head].concat(tail);
  }

  // function buildBinaryExpression(head, tail) {
  //   return tail.reduce(function(result, element) {
  //     return {
  //       type: "BinaryExpression",
  //       operator: element[1],
  //       left: result,
  //       right: element[3]
  //     };
  //   }, head);
  // }

  // function buildLogicalExpression(head, tail) {
  //   return tail.reduce(function(result, element) {
  //     return {
  //       type: "LogicalExpression",
  //       operator: element[1],
  //       left: result,
  //       right: element[3]
  //     };
  //   }, head);
  // }

  function optionalList(value) {
    return value !== null ? value : [];
  }
}

start = (scriptContext / tagContext)*

scriptContext = cfscript / scriptComment / script
tagContext = tag / selfClosedTag / tagComment / expression

// TODO: should optionally be surrounded in parens, e.g.
//  realExpress = "("? expression ")"?
// TODO: should include number type?
expression = string / func / memberExpression / identifier / struct / array / /*binaryExpression /*/ ternary

// BASE UNITS
// ================

escape_character
  = "\\"

eq
  = "="

colon
  = ":"

comma
  = ","

doublequote "double quote"
  = '"'

singlequote "single quote"
  = "'"

hash
  = "#"

questionmark
  = "?"

// most ascii characters except: non-printing chars(x0-x1F), quotation marks (x22), single quotes (x27), backslash (x5C)
// unescaped = [\x20-\x21\x23-\x26\x28\x5B\x5D-\u10FFFF]
unescaped
  = [\x20-\x21\x23-\x5B\x5D-\u10FFFF]

HEXDIG
  = [0-9a-f]i

any
  = .

ws "whitespace"
  = [ \t\n\r]*
nonws "non whitespace"
  = [^ \t\n\r]

character
  = unescaped
  / escape_sequence

escape_sequence "escape sequence"
  = escape_character sequence:(
      doublequote
    / singlequote
    / "\\"
    / "/"
    / "b" { return "\b"; }
    / "f" { return "\f"; }
    / "n" { return "\n"; }
    / "r" { return "\r"; }
    / "t" { return "\t"; }
    / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
         return String.fromCharCode(parseInt(digits, 16));
       }
  ) { return sequence; }





// SCRIPT CONTEXT
// ================

scriptComment
  = scriptLineComment
  / scriptBlockComment

doubleslash
  = "//"

scriptLineCommentText
  = $([^\n\r] . )+

scriptLineComment "script single line comment"
  = doubleslash t:scriptLineCommentText* {
    return {
      type: 'comment',
      tagContext: false,
      body: t.join(''),
      singleLine: location().start.line === location().end.line
    }
  }

scriptOpenBlockComment
  = "/*"

scriptCloseBlockComment
  = "*/"

scriptBlockCommentText
  = $((!scriptOpenBlockComment)(!scriptCloseBlockComment) . )+

scriptBlockComment "script block comment"
  = scriptOpenBlockComment t:scriptBlockCommentText* scriptCloseBlockComment {
    return {
      type: 'comment',
      tagContext: false,
      body: t.join(''),
      singleLine: location().start.line === location().end.line
    }
  }



cfscript
  = "todo: write rule"

script
  = "todo: write rule"



// TAG CONTEXT
// ================

tag
  = e:openTag ws a:( tagContext / expression / text )* ws f:closeTag {
    if (e.name !== f.name) {
      return false;
    }
    return {
      type: 'tag',
      selfClosed: false,
      name: e.name,
      attributes: e.attributes,
      body: a
    };
  }

selfClosedTag
  = "<" main:identifier attributes:attribute* ws ( ">" / "/>" ) {
    return {
      type: 'tag',
      selfClosed: true,
      name: main.value,
      attributes: attributes
    }
  }

openTag
  = "<" main:identifier attributes:attribute* ws ">" {
    return {
      name: main.value,
      attributes: attributes
    }
  }

closeTag
  = "</" main:identifier ws ">" {
    return {
      name: main.value,
      attributes: []
    }
  }





text
  = characters:$((!"<")(!"</") c:any (!">")(!tagCloseComment))+ {
    return {
        type: 'text',
        value: characters
    }
  }








attribute
  = ws attr:expression value:(ws eq ws val:expression {return val;})? { 
    return {
      type: 'attribute',
      attr: attr,
      value: value
    };
  }




// TAG COMMENTS
//============


tagOpenComment
  = "<!---"

tagCloseComment
  = "--->"

tagCommentText
  = $((!tagOpenComment)(!tagCloseComment) . )+

// for now, going to skip any whitespace handling with comments,
// formatting will be preserved exactly as written
tagComment "tag comment"
  = tagOpenComment t:tagCommentText* tagCloseComment {
    return {
      type: 'comment',
      tagContext: true,
      body: t.join(''),
      singleLine: location().start.line === location().end.line
    }
  }




// STRINGS
// ============
/*
If you change `doublequote_character` and `singlequote_character` to `character`,
the online parser seems to be able to parse strings with escaped quotes.
But, doing so breaks a few other tests, and still doesn't work with escaped strings in my unit tests.
So, another approach will need to be investigated
*/
string "string"
  = doublequote text:(doublequote_character*) doublequote {
    return { type: 'string', value: text.join('') };
  }
  / singlequote text:(singlequote_character*) singlequote {
    return { type: 'string', value: text.join('') };
  }

doublequote_character
  = (!doublequote) c:character { return c; }

singlequote_character
  = (!singlequote) c:character { return c; }





// identifier
// ===========

// Note: Number Sign is Adobe's terminology, not mine
// https://helpx.adobe.com/coldfusion/developing-applications/the-cfml-programming-language/using-expressions-and-number-signs/using-number-signs.html
// TODO: there should be a separate datatype for values wrapped in ##
// similar to how an expression wrapped in () is identical to one without (), except the wrapper
// it should be abstracted because it is write optional
identifier "identifier"
  = h1:hash? value:$([0-9a-zA-Z_\$]+) h2:hash? {
    // unmatched hashtags
    if (h1 && !h2 || !h1 && h2) {
      return false
    }
    return {
      type: 'identifier',
      value: value,
      useNumberSign: !!(h1 && h2)
    }
  }






// FUNCTION CALL
// ==============

// TODO: what are valid function characters?
func "function call"
  = h1:hash? v:$([a-zA-Z0-9_]+) ws "(" ws args:argumentList ws ")" h2:hash? {
    // unmatched hashtags
    if (h1 && !h2 || !h1 && h2) {
      return false
    }
    return {
      type: 'function',
      name: v,
      args: args,
      useNumberSign: !!(h1 && h2)
    }
  }

argumentList
  = args:(
      head:argument
      tail:(ws comma ws a:argument ws { return a; })*
      { return buildList(head, tail); }
    )? { return optionalList(args); }


// may include named arguments, may just be a value
// value can be any valid coldfusion expression (I think)
argument "argument"
  = ws arg:( a:(identifier / string) ws eq ws { return a; })? val:expression { 
    return {
      type: 'attribute',
      arg: arg,
      value: val
    };
  }





// NUMBER
// ==========
number "number"
  = [0-9\.]+





// STRUCT
// =========
// ColdFusion does not accept comma after final property assignment
struct "struct literal"
  = "{" ws properties:propertyNameAndValueList? ws "}" {
    return {
      type: "struct",
      properties: optionalList(properties)
    };
  }

propertyNameAndValueList
  = head:propertyAssignment tail:(ws "," ws p:propertyAssignment {return p;})* {
    return buildList(head, tail);
  }

propertyAssignment
  = key:(identifier / string) ws (eq / colon) ws value:expression {
    return {
      type: "structProperty",
      key: key,
      value: value
    };
  }








// ARRAY
// =========
// from https://github.com/pegjs/pegjs/blob/master/examples/json.pegjs
// I think this is better for handling optional commas (e.g. after last value)
// ColdFusion does not accept comma after final element
array "array literal"
  = "[" ws
    values:(
      head:expression
      tail:(ws comma ws e:expression ws { return e; })*
      { return buildList(head, tail); }
    )?
    ws "]" { 
      return {
        type: 'array',
        elements: optionalList(values)
      }
    }




// TERNARY
// ============

// ternary "ternary" =
//   condition:(expression ws)* ws questionmark ws ifBlock:expression ws colon ws elseBlock:expression {
//     return {
//       type: 'ternary',
//       condition: condition,
//       ifBlock: ifBlock,
//       elseBlock: elseBlock
//     }
//   }

ternary "ternary"
  = "ternary?something:somethingelse"






// argument = path
// 
// path =
//   first:identifier rest:("." s:identifier { return s; })* {
//     return {
//       type: 'path',
//       value: [first].concat(rest)
//     };
//   }





// MEMBER
// ===================

// modified from javascript.pegjs
// TODO: update "head" to be more broad.
// could be function call, struct, array... anything that could have a property or method on it after evaluation
// if issues, refer to original implementation - a lot was stripped for this version
memberExpression
  = head:identifier 
    tail:(
        ws "[" ws property:expression ws "]" {
          return { property: property };
        }
      / ws "." ws property:expression {
          return { property: property };
        }
    )*
    {
      return tail.reduce(function(result, element) {
        return {
          type: "memberExpression",
          object: result,
          property: element.property
        };
      }, head);
    }



// BINARY EXPRESSION
// ===================

// TODO figure out how to do this in a way that PEGjs doesn't mind
// it complains about the possible infinite recursion, my guess is because it starts with an expression which could be itself
// but... that's true - the first part of the expression could be anything
// maybe need more subdivisions to be more explicit with which kind of operators
// can act on which kinds of expressions?
binaryExpression
  = left:expression ws operator:binaryOperator ws right:expression {
    return {
      type: "binaryExpression",
      operator: operator,
      left: left,
      right: right
    };
  }

binaryOperator
  = decisionOperator
  / eq
  / booleanOperator
  / arithmeticBinaryOperator
  / arithmeticAssignmentOperator
  / stringOperator


// OPERATORS
// ===================
// https://help.adobe.com/en_US/ColdFusion/9.0/Developing/WSc3ff6d0ea77859461172e0811cbec09d55-7ffc.html#WSc3ff6d0ea77859461172e0811cbec09d55-7ffa
// must account for both uppercase and lowercase

decisionOperator
  = "EQ"                    / "eq"
  / "IS"                    / "is"
  / 'EQUAL'                 / 'equal'
  / "NEQ"                   / "neq"
  / "IS NOT"                / "is not"
  / "NOT EQUAL"             / "not equal"
  / "GT"                    / "gt"
  / "GREATER THAN"          / "greater than"
  / "GTE"                   / "gte"
  / "GE"                    / "ge"
  / "GREATER THAN OR EQUAL" / "greater than or equal"
  / "LT"                    / "lt"
  / "LESS THAN"             / "less than"
  / "LTE"                   / "lte"
  / "LE"                    / "le"
  / "LESS THAN OR EQUAL"    / "less than or equal"
  / "CONTAINS"              / "contains"
  / "DOES NOT CONTAIN"      / "does not contain"

booleanOperator
  = "!"
  / "&&"
  / "||"
  / "NOT" / "not"
  / "AND" / "and"
  / "OR"  / "or"
  / "XOR" / "xor"
  / "EQV" / "eqv"
  / "IMP" / "imp"

arithmeticBinaryOperator
  = "+"
  / "-"
  / "*"
  / "/"
  / "%"
  / "\\" // integer division - will this cause issues with escape chars?
  / "^"
  / "MOD" / "mod"

// can be prefix or postfix
arithmeticUnaryOperator
  = "++"
  / "--"
  / "+"
  / "-"

// TODO: should this just be an `assignmentOperator`
arithmeticAssignmentOperator
  = "+="
  / "-="
  / "*="
  / "/="
  / "%="
  / "&=" // strings, not exactly arithmetic

// string concatenation
stringOperator
  = "&"