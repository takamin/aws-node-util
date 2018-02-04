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
BNF.strlitDQ = BNF.lex("STRLIT-DQ");
BNF.strlitSQ = BNF.lex("STRLIT-SQ");
BNF.comma = BNF.literal(",");

var log = function() {};
BNF.setDebug = function(debug) {
    if(debug) {
        log = function() {
            var arg = Array.from(arguments);
            var indent = arg.splice(0,1);
            console.log("  ".repeat(indent) + arg.join(" "));
        }
    } else {
        log = function() {};
    }
};

BNF.ParseResult = function() { };
BNF.ParseResult.prototype.existsTerm = function(name) {
    var term = this.getTerm(name);
    if(term !== false) {
        return term.match;
    }
    return false;
};
BNF.ParseResult.prototype.getTerm = function(name) {
    var n = this.terms.length;
    for(var i = 0; i < n; i++) {
        if(this.terms[i].term === name) {
            log(0, "[BNF.ParseResult.getTerm]", name, "found");
            return this.terms[i];
        }
    }
    log(0, "[BNF.ParseResult.getTerm]", name, "NOT found");
    return false;
};
function strUnescape(s) {
    var ss = "";
    var len = s.length;
    for(var i = 0; i < len; i++) {
        var c = s.charAt(i);
        var cc = c.charCodeAt(0);
        switch(c) {
            case "\t": ss += "\\t"; break;
            case "\r": ss += "\\r"; break;
            case "\n": ss += "\\n"; break;
            default:
                if(0x20 <= cc && cc <= 0x7f || cc > 0xff) {
                    ss += c;
                } else if(cc <= 0xff) {
                    ss += "\\x" + parseInt(cc, 16);
                }
                break;
        }
    }
    return ss;
}
function unescapeDQ(s) {
    s = strUnescape(s);
    var ss = "";
    var len = s.length;
    for(var i = 0; i < len; i++) {
        var c = s.charAt(i);
        var cc = c.charCodeAt(0);
        if(c == "\"") {
            ss += "\\\"";
        } else {
            ss += c;
        }
    }
    return ss;
}
function unescapeSQ(s) {
    s = strUnescape(s);
    var ss = "";
    var len = s.length;
    for(var i = 0; i < len; i++) {
        var c = s.charAt(i);
        var cc = c.charCodeAt(0);
        if(c == "'") {
            ss += "\\'";
        } else {
            ss += c;
        }
    }
    return ss;
}
BNF.ParseResult.prototype.getTermsList = function(indent) {
    indent = indent || 0;
    var s = []
    this.terms.forEach(function(term) {
        log(indent, term.term, term.terms.length);
        if(term.terms.length == 0) {
            switch(term.lex.getType()) {
            case "STRLIT-DQ":
                s.push("\"" + unescapeDQ(term.lex.getTerm()) + "\"");
                break;
            case "STRLIT-SQ":
                s.push("'" + unescapeSQ(term.lex.getTerm()) + "'");
                break;
            default:
                s.push(term.lex.getTerm());
                break;
            }
        } else {
            term.getTermsList(indent+1).forEach(function(term) {
                s.push(term);
            });
        }
    });
    log(indent, s.join('|'));
    return s;
};

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
                 lex.getTerm() === "<" && lex2.getTerm() === ">" ||
                 lex.getTerm() === ">" && lex2.getTerm() === "="))
            {
                lex.setTerm(lex.getTerm() + lex2.getTerm());
                rawLexList[i + 1] = null;
            } else if(lex2 != null && lex.getType() === "PUNCT" &&
                     lex.getTerm() === ":" && lex2.getType() === "IDENT")
            {
                lex.setType("IDENT");
                lex.setTerm(lex.getTerm() + lex2.getTerm());
                rawLexList[i + 1] = null;
            }
            lexList.push(lex);
        }
    }
    var result = this.parseSentence(this._root, lexList, 0, 0);
    log(0, JSON.stringify(result, null, "  "));
    BNF.logResult(result);
    return result;
};

BNF.prototype.parseSentence = function(root, lexList, lexIndex, indent) {
    log(indent, "BNF:", root, "(at", lexIndex, ")");
    var parser = {};
    if(!(root in this._bnf)) {
        throw new Error(root + " is not declared in BNF");
    }
    var declaration = this._bnf[root];
    var nDecl = declaration.length;

    var result = new BNF.ParseResult();
    result.match = false;
    result.term = root;
    result.lexCount = 0;
    result.terms = [];

    for(var iDecl = 0; iDecl < nDecl; iDecl++) {
        var termList = declaration[iDecl];
        try {
            var termResult = this.parseTermList(termList, lexList, lexIndex, indent + 1);
            if(termResult.match) {
                result.terms = termResult.terms;
                result.match = true;
                result.lexCount += termResult.lexCount;
                break;
            }
        } catch (err) {
            throw new Error(err.message + "\nat " + root + "[" + iDecl + "]");
        }
    }
    return result;
};

BNF.prototype.parseTermList = function(termList, lexList, lexIndex, indent) {
    if(termList == null) {
        throw new Error("Illegal termList is entried in BNF --- " + JSON.stringify(termList));
    }
    var nTerm = termList.length;

    var result = new BNF.ParseResult();
    result.match = true;
    result.lexCount = 0;
    result.terms = [];

    for(var iTerm = 0; iTerm < nTerm; iTerm++) {
        var term = termList[iTerm];
        if(term == null) {
            throw new Error("null term is entried at " + iTerm);
        }
        var termResult = new BNF.ParseResult();
        termResult.term = termList[iTerm];
        termResult.match = false;
        termResult.lex = null;
        termResult.optional = false;
        termResult.terms = [];

        var termType = typeof(termResult.term);
        if(termType != "string" && termType !== "object" || Array.isArray(termResult.term)) {
            throw new Error("Illegal BNF definition at " + JSON.stringify(termResult.term));
        }
        if(termType === "string") {
            termResult.optional = (termResult.term.match(/^\[.*\]$/) ? true : false);
            termResult.term = termResult.term.replace(/^\[(.*)\]$/, "$1");
            if(lexIndex < lexList.length) {
                var subResult = this.parseSentence(termResult.term, lexList, lexIndex, indent);
                termResult.match = subResult.match;
                termResult.terms = subResult.terms;
                if(termResult.match) {
                    result.lexCount += subResult.lexCount;
                    lexIndex += subResult.lexCount;
                }
            }
        } else {
            if(lexIndex < lexList.length) {
                termResult.lex = lexList[lexIndex];
                var lexValue = null;
                switch(termResult.term.role) {
                    case "lit": lexValue = termResult.lex.getTerm(); break;
                    case "lex": lexValue = termResult.lex.getType(); break;
                }

                termResult.match = (lexValue.toUpperCase() === termResult.term.value.toUpperCase());
                if(termResult.match) {
                    result.lexCount++;
                    lexIndex++;
                    log(indent, "match: ", JSON.stringify(termResult.lex),
                            "( at " + lexIndex + ")");
                }
            }
        }
        result.terms.push(termResult);
        if(!termResult.optional && !termResult.match) {
            result.match = false;
            result.lexCount = 0;
            result.terms = [];
            break;
        }
    }
    return result;
};

BNF.logResult = function(parseResult) {
    BNF._logResult(parseResult.terms);
};

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
};
module.exports = BNF;
