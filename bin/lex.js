#!/bin/env node
"use strict";
var fs = require("fs");
var lexana = require("../lib/lexana.js");
var hasharg = require("hash-arg");
var listit = require("list-it");
var arg = hasharg.get("filename");
if(!arg.filename) {
    console.error("ERROR: no source given");
    console.error("> node testLexana <source filename>");
    process.exit(1);
}
fs.readFile(arg.filename, "utf-8", function(err, data) {
    if(err) {
        console.error(err);
        process.exit(1);
    }
    var tokens = null;
    try {
        tokens = lexana.parseLexicalElements(data);
    } catch(ex) {
        console.error(
            "ERROR:", ex.message,
            "at", ex.lineNumber + "(" + ex.column + ")");
        tokens = ex.tokenList;
    }
    var buf = listit.buffer({ "autoAlign" : true });
    tokens.forEach(function(token) {
        var term = token.getTerm();
        term = term.replace(/\r*\n/g, "\\n");
        term = term.substring(0,40);
        buf.d([
            token.getLineNumber(),
            token.getColumn(),
            token.getType(),
            term
        ]);
    });
    console.log(buf.toString());
    console.log("token length: ", tokens.length);
});
