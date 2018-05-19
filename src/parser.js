const fs = require('fs');
const path = require('path');
const pegjs = require('pegjs');
const grammar = fs.readFileSync(path.join(__dirname, 'coldfusion.pegjs'));

// generate the logic to parse the file(s)
const parser = pegjs.generate(grammar.toString());

module.exports = parser.parse;
