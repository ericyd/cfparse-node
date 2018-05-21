// https://medium.com/@daffl/beyond-regex-writing-a-parser-in-javascript-8c9ed10576a6



// start = (datatype)*
start = (scriptContext / tagContext)*

scriptContext = cfscript / scriptComment / script
tagContext = tag / selfClosedTag / tagComment / datatype

datatype = string / func / variable / struct / array // number?


// SCRIPT CONTEXT
// ================

cfscript = "//"
scriptComment = "//"
script = "//"



// TAG CONTEXT
// ================

tag =
  e:openTag ws* a:( tagContext / datatype / text )* ws* f:closeTag {
    if (e.name !== f.name) {
      return false;
    }
    return {
      type: 'tag',
      selfClosed: false,
      name: e.name,
      attributes: e.attributes,
      content: a
    };
  }

selfClosedTag =
  lab main:variable attributes:attribute* ws* ( rab / crab ) {
    return {
      type: 'tag',
      selfClosed: true,
      name: main.value,
      attributes: attributes
    }
  }

openTag =
  lab main:variable attributes:attribute* ws* rab {
    return {
      name: main.value,
      attributes: attributes
    }
  }

closeTag =
  clab main:variable ws* rab {
    return {
      name: main.value,
      attributes: []
    }
  }





text =
  characters:$((!lab)(!clab) c:any (!rab)(!tagCloseComment))+ {
    return {
        type: 'text',
        value: characters
    }
  }








/*
TODO: I probably need to be more explicit with my data types in everything other than comments
For example, if a value can be a string OR anything else, when rebuilding
the AST into a document the string will need to be identified so it can be wrapped in quotes,
whereas other things will need to NOT be wrapped in quotes.
Therefore, I probably need a data structure for "value" instead of just returning the raw string,
and the data structure needs to be consistent

Probably should abstract "attribute" into a "prop" ("value")? data structure.
props could theoretically be strings too (I think???) so we might need to track type there too 

Also, do I need a number type???
It kind of seems logical to make data structures for each CF type that can exist directly in source code
  * number
  * string
  * struct
  * array
  * function call???
  * variable???
  * query???
*/
attribute =
  ws+ attr:datatype value:(ws* eq ws* val:datatype {return val;})? { 
    return {
      type: 'attribute',
      attr: attr,
      value: value
    };
  }




// TAG COMMENTS
//============

tagOpenComment = "<!---"
tagCloseComment = "--->"
tagCommentText = $((!tagOpenComment)(!tagCloseComment) . )+
// for now, going to skip any whitespace handling with comments,
// formatting will be preserved exactly as written
tagComment "tag comment" = tagOpenComment t:tagCommentText* tagCloseComment {
  return {
    type: 'comment',
    tagContext: true,
    content: t.join(''),
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
string "string" =
  doublequote text:(doublequote_character*) doublequote {
    return { type: 'string', value: text.join('') };
  }
  / singlequote text:(singlequote_character*) singlequote {
    return { type: 'string', value: text.join('') };
  }

doublequote_character =
  (!doublequote) c:character { return c; }

singlequote_character =
  (!singlequote) c:character { return c; }





// VARIABLE
// ===========

// original
variable "variable" =
  value:$([0-9a-zA-Z_\$#]+) {
    return {
      type: 'variable',
      value: value
    }
  }






// FUNCTION CALL
// ==============

// TODO: what are valid function characters?
func "function call" =
  v:$([a-zA-Z0-9_]+) lp args:argument* rp {
    return {
      type: 'function',
      func: v,
      args: args
    }
  }



// ignore commas on either side
// may include named arguments, may just be a value
// value can be any valid coldfusion datatype (I think)
argument "argument" = 
  comma* arg:(variable ws* eq ws*)? val:datatype comma* { 
    return {
      type: 'attribute',
      arg: arg,
      value: val
    };
  }





// NUMBER
// ==========
number "number" = [0-9\.]+





// STRUCT
// =========
struct "struct literal" =
  lcb ws* collection:(kvp:keyValuePair comma? ws* { return kvp; })* ws* rcb {
    return {
      type: 'struct',
      entries: collection
    }
  }

keyValuePair "key value pair" =
  key:(variable / string) ws* (eq / colon) ws* value:(datatype) {
    return {
      type: 'key value pair', // necessary data?
      key: key,
      value: value
    }
  }









// ARRAY
// =========
array "array literal" =
  lsb ws* collection:(d:datatype comma? ws* {return d;})* ws* rsb {
    return {
      type: 'array',
      entries: collection
    }
  }











// argument = path
// 
// path =
//   first:variable rest:("." s:variable { return s; })* {
//     return {
//       type: 'path',
//       value: [first].concat(rest)
//     };
//   }

character =
  unescaped / escape_sequence

escape_sequence "escape sequence" = escape_character sequence:(
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
  )
  { return sequence; }






// PUNCTUATION
// ==============

escape_character = "\\"
eq = "="
colon = ":"
comma = ","
doublequote "double quote" = '"'
singlequote "single quote" = "'"

// brackets
lp = "(" // left paren
rp = ")" // right paren
lcb = "{" // left curly brace
rcb = "}" // right curly brace
lsb = "[" // left square brace
rsb = "]" // right square brace
lab = "<" // left angle bracket
clab = "</" // closing left angle bracket
rab = ">" // right angle bracket
crab = "/>" // closing right angle bracket

// most ascii characters except: non-printing chars(x0-x1F), quotation marks (x22), single quotes (x27), backslash (x5C)
// unescaped = [\x20-\x21\x23-\x26\x28\x5B\x5D-\u10FFFF]
unescaped = [\x20-\x21\x23-\x5B\x5D-\u10FFFF]
HEXDIG = [0-9a-f]i

any = .

ws "whitespace" = [ \t\n\r]
nonws "non whitespace" = [^ \t\n\r]