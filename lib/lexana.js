"use strict";
//
// Token class
//
var Token = function() {
    this._charbuf = [];
    this._term = "";
    this._type = null;
    this._lineNumber = 0;
    this._col = 0;
};
Token.prototype.getTerm = function() {
    return this._term;
};
Token.prototype.pushChar  = function(c) {
    this._charbuf.push(c);
};
Token.prototype.setTerm = function(term) {
    this._term = term;
    this._charbuf = [];
};
Token.prototype.setPos = function(lineNumber, col) {
    this._lineNumber = lineNumber;
    this._col = col;
};
Token.prototype.getLineNumber = function() {
    return this._lineNumber;
};
Token.prototype.getColumn = function() {
    return this._col;
};
Token.prototype.setType = function(type) {
    this._type = type;
};
Token.prototype.getType = function() {
    return this._type;
};
Token.prototype.fixTerm = function() {
    this._term = this._charbuf.join('');
    this._charbuf = [];
};
Token.prototype.isWhiteSpace = function() {
    var t = this.getType();
    return t === "WS" || t === "WS-LINCMT" || t === "WS-BLKCMT";
};

/* Character type */
var isWhite = function(c) {
    return c.match(/^\s/);
};
var isPunct = function(c) {
    return c.match(/^[\!\"\#\$\%\&\'\(\)\-\=\^\~\\\|\@\[\{\;\+\:\*\]\}\,\<\.\>\/\?\_]/);
};
var isAlpha = function(c) {
    return c.match(/^[_a-z]/i);
};
var isAlnum = function(c) {
    return c.match(/^[_a-z0-9]/i);
};
var isDigit = function(c) {
    return c.match(/^[0-9]/);
};

//
// Tokenize
//
// returns an array of tokens
//
module.exports.parseLexicalElements = function(source) {
    var tokenList = [];
    var token = null;
    var lineNum = 1;
    var columnPos = 1;
    var charLen = source.length;
    var i = 0;
    var c = null;
    var mode = "";
    var quotedBy = "";
    var toMode = function(newMode) {
        mode = newMode;
    };
    var endToken = function(currentMode) {
        token.setType(currentMode || mode);
        token.fixTerm();
        tokenList.push(token);
        toMode("");
        token = null;
    };
    var parserError = function(message) {
        var err = new Error(message);
        err.lineNumber = lineNum;
        err.column = columnPos;
        err.message = message;
        err.tokenList = tokenList;
        return err;
    };
    var ungetChar = function() {
        --i;
        --columnPos;
    };
    var refNextChar = function() {
        if(i + 1 >= source.length) {
            throw parserError("unexpected terminate");
        }
        return source.charAt(i + 1);
    };
    var isRegexStart = function() {
        if(i + 1 >= source.length) {
            return false;
        }
        var nextchar = refNextChar();
        if(nextchar == '/' || nextchar == '*') {
            return false;
        }
        var ii = tokenList.length - 1;
        while(ii >= 0 && tokenList[ii].getType() == "WS") {
            --ii;
        }
        if(ii < 0) {
            return true;
        }
        return tokenList[ii].getType() == "PUNCT";
    };
    (function(modeProc) {
        while(i < source.length) {
            c = source.charAt(i);
            modeProc[mode]();
            ++i;
            ++columnPos;
        }
        if(token != null) {
            endToken();
        }
    }({
        "" : function() {
            token = new Token();
            token.setPos(lineNum, columnPos);
            if(isWhite(c)) {
                token.pushChar(c);
                toMode("WS");
            } else if(isAlpha(c)) {
                token.pushChar(c);
                toMode("IDENT");
            } else if(isDigit(c)) {
                token.pushChar(c);
                toMode("NUMLIT");
            } else if(isPunct(c)) {
                token.pushChar(c);
                endToken("PUNCT");
            }
        },
        "WS": function() {
            if(isWhite(c)) {
                token.pushChar(c);
                if(c == "\n") {
                    columnPos = 0;
                    lineNum++;
                }
            } else {
                endToken();
                ungetChar();
            }
        },
        "IDENT": function() {
            if(isAlnum(c)) {
                token.pushChar(c);
            } else {
                endToken();
                ungetChar();
            }
        },
        "NUMLIT": function() {
            if(c.match(/^[0-9a-z]$/i)) {
                token.pushChar(c);
            } else {
                endToken();
                ungetChar();
            }
        }
    }));
    return tokenList;
};
