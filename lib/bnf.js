"use strict";
var lexana = require("../lib/lexana.js");
function BNF(root, bnf) {
    this._root = root;
    this._bnf = bnf;
}
BNF.literal = function(value) { return { role: "lit", value: value }; };
BNF.lex = function(value) { return { role: "lex", value: value }; };
BNF.ident = BNF.lex("IDENT");
BNF.numlit = BNF.lex("NUMLIT");
BNF.strlit = BNF.lex("STRLIT");
BNF.comma = BNF.literal(",");

function log() {
    var arg = Array.from(arguments);
    var indent = arg.splice(0,1);
    console.log("  ".repeat(indent) + arg.join(" "));
}
BNF.prototype.parse = function(source) {
    log(0, "source:", source);
    var rawLexList = lexana.parseLexicalElements(source);
    var lexList = [];
    var n = rawLexList.length;
    for(var i = 0; i < n; i++) {
        var lex = rawLexList[i];
        var lex2 = (i < n - 1) ? rawLexList[i + 1] : null;
        if(lex != null && !lex.isWhiteSpace()) {
            if(lex2 != null && lex.getType() === "PUNCT" && lex2.getType() === "PUNCT" &&
                (lex.getTerm() === "<" && lex2.getTerm() === "=" ||
                 lex.getTerm() === ">" && lex2.getTerm() === "="))
            {
                lex.setTerm(lex.getTerm() + lex2.getTerm());
                rawLexList[i + 1] = null;
            }
            lexList.push(lex);
            log(0, JSON.stringify(lex));
        }
    }
    return this.parseSentence(this._root, lexList, 0, 0);
};

BNF.prototype.parseSentence = function(root, lexList, lexIndex, indent) {
    log(indent, "BNF:", root, "(at", lexIndex, ")");
    var parser = {};
    if(!(root in this._bnf)) {
        throw new Err(root + " is not declared in BNF");
    }
    var declaration = this._bnf[root];
    var nDecl = declaration.length;
    var result = {
        match: false,
        name: root,
        lexCount: 0,
        terms: []
    };
    for(var iDecl = 0; iDecl < nDecl; iDecl++) {
        var termList = declaration[iDecl];
        var termResult = this.parseTermList(termList, lexList, lexIndex, indent + 1);
        if(termResult.match) {
            result.terms = termResult.terms;
            result.match = true;
            result.lexCount += termResult.lexCount;
            break;
        }
    }
    return result;
};

BNF.prototype.parseTermList = function(termList, lexList, lexIndex, indent) {
    var nTerm = termList.length;
    var matchCount = 0;
    var result = {
        match: true,
        lexCount: 0,
        terms: []
    };

    for(var iTerm = 0; iTerm < nTerm && lexIndex < lexList.length; iTerm++) {
        var term = termList[iTerm];
        var termType = typeof(term);
        var termResult = {
            term: term,
            match: null,
            lex: null,
            lexCount: 0,
            optional: false,
            terms: []
        };
        if(termType != "string" && termType !== "object" || Array.isArray(term)) {
            throw new Error("Illegal BNF definition at " + JSON.stringify(term));
        }
        if(typeof(term) === "string") {
            termResult.optional = (term.match(/^\[.*\]$/) ? true : false);
            term = term.replace(/^\[(.*)\]$/, "$1");
            var subResult = this.parseSentence(term, lexList, lexIndex, indent);
            termResult.match = subResult.match;
            termResult.terms = subResult.terms;
            if(termResult.match) {
                termResult.lexCount = subResult.lexCount;
            }
        } else {
            var lex = lexList[lexIndex];
            var lexValue = null;
            switch(term.role) {
                case "lit": lexValue = lex.getTerm(); break;
                case "lex": lexValue = lex.getType(); break;
            }
            termResult.lex = lex;
            termResult.match = (lexValue === term.value);
            if(termResult.match) {
                termResult.lexCount = 1;
                log(indent, "match: ", JSON.stringify(termResult.lex),
                        "( at " + lexIndex + ")");
            }
        }
        result.lexCount += termResult.lexCount;
        lexIndex += termResult.lexCount;
        result.terms.push(termResult);
        if(!termResult.optional && !termResult.match) {
            result.match = false;
            break;
        }
    }
    return result;
}

BNF.logResult = function(parseResult) {
    BNF._logResult(parseResult.terms);
}
BNF._logResult = function(parseResult, indent) {
    indent = indent || 0;
    parseResult.forEach(function(e) {
        if(e.terms.length > 0) {
            log(indent, e.term);
            BNF._logResult(e.terms, indent + 1);
        } else if(e.lex) {
            log(indent, JSON.stringify(e.term),
                    JSON.stringify(e.lex.getTerm()));
        }
    });
}
module.exports = BNF;
