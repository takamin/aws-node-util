"use strict";
function BNF(bnf) {
    this._bnf = bnf;
}
BNF.literal = function(value) { return { role: "lit", value: value }; }
BNF.lex = function(value) { return { role: "lex", value: value }; }
BNF.ident = BNF.lex("IDENT");
BNF.numlit = BNF.lex("NUMLIT");
BNF.strlit = BNF.lex("STRLIT");
BNF.comma = BNF.literal(",");

BNF.prototype.parse = function(root, lexList, lexIndex) {
    lexIndex = lexIndex || 0;
    var parser = {};
    if(!(root in this._bnf)) {
        throw new Err(root + " is not declared in BNF");
    }
    var declaration = this._bnf[root];
    var nDecl = declaration.length;
    for(var iDecl = 0; iDecl < nDecl; iDecl++) {
        var termList = declaration[iDecl];
        var result = parseTerms(termList, lexList, lexIndex);
    }
}

BNF.prototype.parseTerms = function(termList, lexList, lexIndex) {
    var nTerm = termList.length;
    var matchCount = 0;
    var result = {
        match: true,
        terms: []
    };

    for(var iTerm = 0; iTerm < nTerm; iTerm++) {
        var term = termList[iTerm];
        var termType = typeof(term);
        var termResult = {
            match: null,
            term: term,
            lex: [],
            optional: false,
            bnfResult: null
        };
        if(termType != "string" && termType !== "object" || Array.isArray(term)) {
            throw new Error("Illegal BNF definition at " + JSON.stringify(term));
        }
        if(typeof(term) === "string") {
            termResult.optional = term.match(/^\[.*\]$/);;
            term = term.replace(/^\[(.*)\]$/, "$1");
            termResult.bnfResult = parse(this._bnf, term, lexList, lexIndex);
            termResult.match = termResult.bnfResult.match;
        } else {
            var lex = lexList[lexIndex];
            var lexValue = null;
            switch(term.role) {
                case "lit": lexValue = lex.getTerm(); break;
                case "lex": lexValue = lex.getType(); break;
            }
            termResult.lex.push(lex);
            termResult.match = (lexValue === term.value);
        }
        result.terms.push(termResult);
        if(!termResult.optional && termResult.match) {
            result.match = false;
        }
    }
    return result;
}

module.exports = BNF;
