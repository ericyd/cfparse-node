// https://medium.com/@daffl/beyond-regex-writing-a-parser-in-javascript-8c9ed10576a6

// comment like this
start = (datatype)*

datatype = node / closedNode / comment / string / variable / func


text =
  characters:$((!lb)(!clb) c:any (!rb)(!closeComment))+ {
    return {
        type: 'text',
        value: characters
    }
  }

node =
  e:openTag ws* a:( datatype / text )* ws* f:closeTag {
    if (e.name !== f.name) {
      return false;
    }
    return {
      type: 'node',
      selfClosed: false,
      tag: e,
      content: a
    };
  }

closedNode =
  t:selfClosedTag {
    return {
      type: 'node',
      selfClosed: true,
      tag: t
    }
  }

lb "left bracket" = "<"
clb "closing left bracket" = "</"
rb "right bracket" = ">"
crb "closing right bracket" = "/>"
any = .

openTag =
  lb main:variable attributes:attribute* ws* rb {
    return {
      type: 'tag',
      closing: false,
      name: main,
      attributes: attributes
    }
  }

closeTag =
  clb main:variable ws* rb {
    return {
      type: 'tag',
      closing: true,
      name: main
    }
  }

selfClosedTag =
  lb main:variable attributes:attribute* ws* ( rb / crb ) {
    return {
      type: 'tag',
      name: main,
      attributes: attributes
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
  ws+ prop:variable val:(ws* eq ws* val:datatype {return val;})? { 
    return {
      type: 'attribute',
      attr: prop,
      value: val
    };
  }




// COMMENTS
//============

openComment = "<!---"
closeComment = "--->"
commentText = $((!openComment)(!closeComment) . )+
// for now, going to skip any whitespace handling with comments,
// formatting will be preserved exactly as written
comment "comment" = openComment t:commentText* closeComment {
  return {
    type: 'comment',
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
  value:$([0-9a-zA-Z_\$]+) {
    return {
      type: 'variable',
      value: value
    }
  }






// FUNCTION CALL
// ==============

func "function call" =
  v:variable lp args:argument* rp {
    return {
      type: 'function call',
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
struct "struct" =
  lcb collection:keyValCollection rcb {
    return {
      type: 'struct',
      entries: collection
    }
  }

lcb = "{" // left curly brace
rcb = "}" // right curly brace

/*
TODO: ok this is getting overly abstracted, let's start returning some raw arrays;
never will be a need to identify that my data type is a "key value collection"
*/
keyValCollection "key value collection" =
  (kvp:keyValuePair comma? { return kvp; })*

keyValuePair "key value pair" =
  key:(variable / string) (eq / colon) value:(datatype) {
    return {
      type: 'key value pair', // necessary data?
      key: key,
      value: value
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





eq = "="
colon = ":"
escape_character = "\\"
doublequote "double quote" = '"'
singlequote "single quote" = "'"
comma = ","
lp = "(" // left paren
rp = ")" // right paren

// most ascii characters except: non-printing chars(x0-x1F), quotation marks (x22), single quotes (x27), backslash (x5C)
// unescaped = [\x20-\x21\x23-\x26\x28\x5B\x5D-\u10FFFF]
unescaped = [\x20-\x21\x23-\x5B\x5D-\u10FFFF]
HEXDIG = [0-9a-f]i

ws "whitespace" = [ \t\n\r]
nonws "non whitespace" = [^ \t\n\r]