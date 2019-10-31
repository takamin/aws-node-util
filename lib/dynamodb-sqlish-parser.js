"use strict";
var BNF = require("lex-bnf");

function DynamoDbSqlishParser() {}

//
// Basic Terms
//
var CREATE = BNF.literal("CREATE");
var DROP = BNF.literal("DROP");
var TABLE = BNF.literal("TABLE");
var ALTER = BNF.literal("ALTER");
var SELECT = BNF.literal("SELECT");
var INSERT = BNF.literal("INSERT");
var UPDATE = BNF.literal("UPDATE");
var DELETE = BNF.literal("DELETE");
var SET = BNF.literal("SET");
var INTO = BNF.literal("INTO");
var VALUES = BNF.literal("VALUES");
var FROM = BNF.literal("FROM");
var WHERE = BNF.literal("WHERE");
var FILTER = BNF.literal("FILTER");
var LIMIT = BNF.literal("LIMIT");
var BETWEEN = BNF.literal("BETWEEN");
var AND = BNF.literal("AND");
var OR = BNF.literal("OR");
var NOT = BNF.literal("NOT");
var IN = BNF.literal("IN");

DynamoDbSqlishParser.BNF = {
    "sqlish": [
        [ "sqlish-create-table" ],
        [ "sqlish-update-table" ],
        [ "sqlish-delete-table" ],
        [ BNF.literal("SCAN"), "sqlish-scan" ],
        [ BNF.literal("QUERY"), "sqlish-query" ],
        [ "sqlish-put-item" ],
        [ "sqlish-set-item" ],
        [ "sqlish-delete-item" ],
    ],
    "sqlish-create-table": [
        [ CREATE, TABLE, "table-name",
            BNF.literal("("), "key-schema-list", BNF.literal(")"),
            "[create-table-alter-clause]" ],
    ],
    "sqlish-update-table": [
        [ ALTER, TABLE, "table-name", "alter-spec" ],
    ],
    "sqlish-delete-table": [
        [ DROP, TABLE, "table-name" ],
    ],
    "sqlish-scan": [
        [ "[select-clause]", "from-clause", "[where-filter-clause]",
            "[limit-clause]" ],
    ],
    "sqlish-query": [
        [ "[select-clause]", "from-clause", "where-key-clause",
            "[filter-clause]", "[limit-clause]" ],
    ],
    "sqlish-put-item": [
        [
            INSERT, INTO, "table-name",
            BNF.literal("("), "attribute-list", BNF.literal(")"),
            VALUES, BNF.literal("("), "value-list", BNF.literal(")"),
            "[where-key-clause]"
        ],
    ],
    "sqlish-set-item": [
        [
            UPDATE, "table-name",
            SET, "key-value-set",
            "where-key-clause"
        ],
    ],
    "sqlish-delete-item": [
        [ DELETE, FROM, "table-name", "[where-delete-key-clause]" ],
    ],
    "key-schema-list": [
        [ "key-schema", BNF.comma, "key-schema-list" ],
        [ "key-schema" ],
    ],
    "key-schema": [
        [ "attribute-name", "key-type", "key-attribute-type"],
    ],
    "create-table-alter-clause": [
        [ ALTER, "alter-spec" ],
    ],
    "alter-spec": [
        [BNF.literal("("), "alter-specifier-list", BNF.literal(")") ],
        ["alter-specifier"],
    ],
    "alter-specifier-list": [
        ["alter-specifier", BNF.comma, "alter-specifier-list"],
        ["alter-specifier"],
    ],
    "alter-specifier": [
        [ SET, BNF.literal("readCapacityUnit"), BNF.literal("="), BNF.numlit ],
        [ SET, BNF.literal("writeCapacityUnit"), BNF.literal("="), BNF.numlit ],
    ],
    "attribute-list": [
        [ "attribute-name", BNF.comma, "attribute-list" ],
        [ "attribute-name" ],
    ],
    "key-value-set": [
        [ "key-value", BNF.comma, "key-value-set" ],
        [ "key-value" ],
    ],
    "key-value": [
        ["attribute-name", BNF.literal("="), "value"],
    ],
    "attribute-name": [
        [ BNF.ident ],
    ],
    "select-clause": [
        [ SELECT, "key-list" ],
    ],
    "key-list": [
        [ "column-name", BNF.comma, "key-list" ],
        [ "column-name" ],
    ],
    "column-name": [
        [ BNF.ident ],
    ],
    "from-clause": [
        [ FROM, "table-name" ],
    ],
    "table-name": [
        [ BNF.ident ],
    ],
    "where-filter-clause": [
        [ WHERE, "condition-expression" ],
    ],
    "where-key-clause": [
        [ WHERE, "condition-expression" ],
    ],
    "where-delete-key-clause": [
        [ WHERE, "and-expression" ],
    ],
    "filter-clause": [
        [ FILTER, "condition-expression" ],
    ],
    "condition-expression" : [
        [ "or-expression" ],
    ],
    "or-expression" : [
        [ "and-expression", OR, "condition-expression" ],
        [ "and-expression" ],
    ],
    "and-expression" : [
        [ "compare-expression", AND, "condition-expression" ],
        [ "compare-expression" ],
    ],
    "compare-expression": [
        [ BNF.literal("("), "condition-expression", BNF.literal(")") ],
        [ BNF.ident, "comparator", "value" ],
        [ BNF.ident, BETWEEN, "between-range" ],
        [ BNF.ident, IN, BNF.literal("("), "value-list", BNF.literal(")") ],
        [ "function" ],
        [ NOT, "condition-expression" ],
    ],
    "comparator": [
        [BNF.literal("=") ],
        [BNF.literal("<") ],
        [BNF.literal("<=") ],
        [BNF.literal(">") ],
        [BNF.literal(">=") ],
        [BNF.literal("<>") ],
    ],
    "function": [
        [ BNF.literal("attribute_exists"), BNF.literal("("), "path", BNF.literal(")") ],
        [ BNF.literal("attribute_not_exists"), BNF.literal("("), "path", BNF.literal(")") ],
        [ BNF.literal("attribute_type"), BNF.literal("("),
                "path", BNF.comma, "attribute-type",
            BNF.literal(")") ],
        [ BNF.literal("begins_with"), BNF.literal("("),
                "path", BNF.comma, "value",
            BNF.literal(")") ],
        [ BNF.literal("contains"), BNF.literal("("),
                "path", BNF.comma, "value",
            BNF.literal(")") ],
        [ BNF.literal("size"), BNF.literal("("), "path", BNF.literal(")") ],
    ],
    "path": [
        [ BNF.ident, BNF.literal("."), "path" ],
        [ BNF.ident ],
    ],
    "between-range": [
        [ "value", AND, "value" ],
    ],
    "value-list": [
        ["value", BNF.comma, "value-list" ],
        ["value" ],
    ],
    "value": [
        [ BNF.numlit ],
        [ BNF.strlitDQ ],
        [ BNF.strlitSQ ],
        [ BNF.ident ],
    ],
    "limit-clause": [
        [ LIMIT, "limit-count" ],
    ],
    "limit-count": [
        [ BNF.numlit ],
    ],
    "key-type": [
        [ BNF.literal("HASH") ],
        [ BNF.literal("RANGE") ],
    ],
    "key-attribute-type": [
        [ BNF.literal("S") ],
        [ BNF.literal("N") ],
        [ BNF.literal("BOOL") ],
    ],
    "attribute-type": [
        [ BNF.literal("S") ],
        [ BNF.literal("SS") ],
        [ BNF.literal("N") ],
        [ BNF.literal("NS") ],
        [ BNF.literal("B") ],
        [ BNF.literal("BS") ],
        [ BNF.literal("BOOL") ],
        [ BNF.literal("NULL") ],
        [ BNF.literal("L") ],
        [ BNF.literal("M") ],
    ],
};

const isKeyword = require("./dynamodb-keywords.js").isKeyword;

//
// Expression parser
//
var Expression = function() { };

//
// Lexical analysis
//
Expression.prototype.tokenize = function(expr) {
    var bnfWords = new BNF("words", {
        "words": [
            [ "word", "words", ],
            [ "word", ],
        ],
        "word": [
            [ "boolean-literal" ],
            [ "comparison-operator" ],
            [ "conditional-operator" ],
            [ "conditional-function" ],
            [ "string-literal" ],
            [ "number-literal" ],
            [ "identifier" ],
            [ "white-space" ],
            [ "delimitor" ],
            [ BNF.lex("bool") ],
            [ BNF.lex("comp") ],
            [ BNF.lex("oper") ],
            [ BNF.lex("deli") ],
            [ BNF.lex("func") ],
            [ BNF.lex("str") ],
            [ BNF.lex("num") ],
            [ BNF.lex("ident") ],
        ],
        "boolean-literal": [
            [ BNF.literal("true") ],
            [ BNF.literal("false") ]
        ],
        "comparison-operator": [
            [ BNF.literal("=") ],
            [ BNF.literal("<"), BNF.literal(">") ],
            [ BNF.literal("<"), BNF.literal("=") ],
            [ BNF.literal("<") ],
            [ BNF.literal(">"), BNF.literal("=") ],
            [ BNF.literal(">") ],
        ],
        "conditional-operator": [
            [ BNF.literal("AND") ],
            [ BNF.literal("OR") ],
            [ BNF.literal("NOT") ],
            [ BNF.literal("BETWEEN") ],
            [ BNF.literal("IN") ],
        ],
        "white-space": [
            [ BNF.lex("WS") ]
        ],
        "delimitor": [
            [ BNF.literal(",") ],
            [ BNF.literal("(") ],
            [ BNF.literal(")") ],
            [ BNF.lex("PUNCT") ],
        ],
        "conditional-function": [
            [ BNF.literal("attribute_exists") ],
            [ BNF.literal("attribute_not_exists") ],
            [ BNF.literal("attribute_type") ],
            [ BNF.literal("begins_with") ],
            [ BNF.literal("contains") ],
            [ BNF.literal("size") ],
        ],
        "string-literal": [
            [ "string-literal-dq" ],
            [ "string-literal-sq" ],
        ],
        "string-literal-dq": [
            [ BNF.literal('"'), "string-literal-dq-end" ],
        ],
        "string-literal-dq-end": [
            [ BNF.literalUntil('"') ],
        ],
        "string-literal-sq": [
            [ BNF.literal("'"), "string-literal-sq-end" ],
        ],
        "string-literal-sq-end": [
            [ BNF.literalUntil("'") ],
        ],
        "number-literal": [
            [ BNF.literal("-"), "number-literal" ],
            [ BNF.lex("NUMLIT"), BNF.literal("."), BNF.lex("NUMLIT") ],
            [ BNF.lex("NUMLIT") ],
        ],
        "identifier": [
            [ BNF.ident, BNF.literal("."), "identifier" ],
            [ BNF.literal(":"), BNF.ident ],
            [ BNF.ident ],
        ],
    }, {
        "boolean-literal": "bool",
        "comparison-operator": "comp",
        "conditional-operator": "oper",
        "delimitor": "deli",
        "conditional-function": "func",
        "string-literal": "str",
        "number-literal": "num",
        "identifier": "ident",
    });
    var bnfTokens = BNF.tokenize(expr, bnfWords);
    if(bnfTokens != null && !Array.isArray(bnfTokens) && !bnfTokens.match) {
        throw new Error("Could not tokenize " + expr);
    }
    bnfTokens.forEach( token => {
        var term = token.getTerm();
        if(token.getType() == "str") {
            switch(term.replace(/^(.).*(.)$/, "$1$2")) {
                case '""':
                    token.setTerm(unescapeDQ(term.replace(/^"(.*)"$/, "$1")));
                    break;
                case "''":
                    token.setTerm(unescapeSQ(term.replace(/^'(.*)'$/, "$1")));
                    break;
                default:
                    throw new Error("Broken string-literal " + term);
            }
        }
    });
    this.tokens = bnfTokens.map( t => {
        return { "type": t.getType(), "lex": t.getTerm() };
    });
};

var ProjectionExpression = function() {};
ProjectionExpression.prototype = new Expression();
ProjectionExpression.prototype.parse = function(expr) {
    this.tokens = [];
    this.expression = [];
    this.names = {};

    this.tokenize(expr);

    this.tokens.forEach(function(token) {
        switch(token.type) {
        case "ident":
            this.expression.push(
                token.lex.split('.').map(
                    function(ident) {
                        if(isKeyword(ident)) {
                            var alt = "#" + ident;
                            this.names[alt] = ident;
                            return alt;
                        }
                        return ident;
                    }, this).join('.'));
            break;
        case 'deli':
            if(token.lex == ',') {
                this.expression.push(token.lex);
            } else {
                throw new Error("Invalid delimitor. " + expr);
            }
            break;
        default:
            throw new Error("R-Value cannot be included. " + expr);
        }
    }, this);
};
ProjectionExpression.prototype.getExpression = function() {
    return this.expression.join(" ");
};
ProjectionExpression.prototype.getAttributeNames = function() {
    if(Object.keys(this.names).length <= 0) {
        return null;
    }
    return this.names;
};

//
// Condition expression parser
//
var ConditionExpression = function() { };
ConditionExpression.prototype = new Expression();

ConditionExpression.prototype.getExpression = function() {
    return this.expression.join(" ");
};
ConditionExpression.prototype.getAttributeNames = function() {
    if(Object.keys(this.names).length <= 0) {
        return null;
    }
    return this.names;
};
ConditionExpression.prototype.getAttributeValues = function() {
    if(Object.keys(this.values).length <= 0) {
        return null;
    }
    return this.values;
};

//
// Parse
//
ConditionExpression.prototype.parse = function(expr, vidx) {
    this.tokens = [];
    this.expression = [];
    this.names = {};
    this.values = {};

    this.tokenize(expr);

    vidx = vidx | 0;
    var setValuePlaceholder = function(value) {
        var phname;
        for(;;) {
            phname = ":v" + vidx;
            vidx++;
            if(!(phname in this.values)) {
                break;
            }
        }
        this.expression.push(phname);
        this.values[phname] = value;
    }.bind(this);
    this.tokens.forEach(function(token) {
        switch(token.type) {
        case "bool":
            setValuePlaceholder({ "BOOL" : (token.lex == "true") });
            break;
        case "num":
            setValuePlaceholder({ "N" : "" + token.lex });
            break;
        case "str":
            setValuePlaceholder({ "S" : "" + token.lex });
            break;
        case "ident":
            if(token.lex.charAt(0) === ":") {
                if(token.lex in this.values && this.values[token.lex] != null) {
                    throw new Error("the placeholder " +
                            token.lex +
                            " already has value");
                }
                this.expression.push(token.lex);
                this.values[token.lex] = null;
                break;
            }
            this.expression.push(
                token.lex.split('.').map(
                    function(ident) {
                        if(isKeyword(ident)) {
                            var alt = "#" + ident;
                            this.names[alt] = ident;
                            return alt;
                        }
                        return ident;
                    }, this).join('.'));
            break;
        default:
            this.expression.push(token.lex);
            break;
        }
    }, this);
};
//
// ItemList expression parser
//
// Parser class to convert a string of a comma separated assignment expression to
// DynamoDB map object representing its Item.
//
// EXAMPLE:
//
//  input string:
//      id="123",timestamp=145678900,test.name="foo",test.pass=true,value.version="0.6.6"
//
//  output object:
//      {
//          "id":       {"S": "123"},
//          "timestamp":{"N": "145678900"},
//          "test": {
//              "M": {
//                  "name": {"S": "foo"},
//                  "pass": {"BOOL": true}
//              }
//          },
//          "value" : {"M" : {"version": {"S": "0.6.6"}}}
//      }
//
var ItemListExpression = function() {};
ItemListExpression.prototype = new Expression();
ItemListExpression.prototype.parse = function(itemList) {
    var map = {};
    this.tokens = [];
    this.tokenize(itemList);
    
    var attributeItems = [];
    var attributeItem = [];
    this.tokens.forEach(function(token) {
        if(token.type == "deli" && token.lex == ",") {
            attributeItems.push(attributeItem);
            attributeItem = [];
        } else {
            attributeItem.push(token);
        }
    });
    attributeItems.push(attributeItem);
    attributeItems.forEach(function(attributeItem) {
        var expr = attributeItem.map(function(token) { return token.lex; }).join(" ");
        if(attributeItem.length != 3) {
            throw new Error("Invalid format. " + expr);
        } else if(attributeItem[0].type != "ident") {
            throw new Error("Lvalue must be a item name or map path. " + expr);
        } else if(attributeItem[1].type != "comp" || attributeItem[1].lex != "=") {
            throw new Error("The expression must be an assignment. " + expr);
        } else if(attributeItem[2].type != "bool" &&
                attributeItem[2].type != "str" &&
                attributeItem[2].type != "num" &&
                attributeItem[2].lex.charAt(0) !== ":")
        {
            throw new Error("Rvalue must be a value. " + expr);
        }
        var LTok = attributeItem[0];
        var RTok = attributeItem[2];
        var paths = LTok.lex.split('.');
        var obj = map;
        for(var i = 0; i < paths.length; i++) {
            var path = paths[i];
            if(!(path in obj)) {
                if(i < paths.length - 1) {
                    obj[path] = { "M" : {} };
                } else {
                    obj[path] = { /* T.B.D */ };
                }
            }
            if("M" in obj[path]) {
                obj = obj[path].M;
            } else {
                obj = obj[path];
            }
        }
        switch(RTok.type) {
        case "bool":
            obj["BOOL"] = (RTok.lex == "true");
            break;
        case "num":
            obj["N"] = "" + RTok.lex;
            break;
        case "str":
            obj["S"] = "" + RTok.lex;
            break;
        default:
            break;
        }
    });
    return map;
};

DynamoDbSqlishParser.parseProjectionExpression = function(
        projectionExpression, expressionAttributeNames)
{
    var parser = new ProjectionExpression();
    parser.parse(projectionExpression);
    var names = parser.getAttributeNames();
    if(names) {
        Object.keys(names).forEach(function(ph) {
            expressionAttributeNames[ph] = names[ph];
        });
    }
    return parser.getExpression();
};
DynamoDbSqlishParser.parseConditionExpression = function(
        conditionExpression,
        expressionAttributeNames,
        expressionAttributeValues)
{
    var parser = new ConditionExpression();
    parser.parse(conditionExpression,
            Object.keys(expressionAttributeValues).length);

    var names = parser.getAttributeNames();
    if(names) {
        Object.keys(names).forEach(function(ph) {
            expressionAttributeNames[ph] = names[ph];
        });
    }

    var values = parser.getAttributeValues();
    if(values) {
        Object.keys(values).forEach(function(ph) {
            expressionAttributeValues[ph] = values[ph];
        });
    }

    return parser.getExpression();
};


//
// Parse ItemList expression and returns DynamoDB table item for put-item operation.
//
// EXAMPLE:
//
//  input string:
//      id="123",timestamp=145678900,test.name="foo",test.pass=true,value.version="0.6.6"
//
//  output object:
//      {
//          "id":       {"S": "123"},
//          "timestamp":{"N": "145678900"},
//          "test": {
//              "M": {
//                  "name": {"S": "foo"},
//                  "pass": {"BOOL": true}
//              }
//          },
//          "value" : {"M" : {"version": {"S": "0.6.6"}}}
//      }
//
DynamoDbSqlishParser.parseItemListToMap = function(itemList) {
    var parser = new ItemListExpression();
    return parser.parse(itemList);
};

DynamoDbSqlishParser.WordBuilder = new BNF("words", {
    "words": [
        [ "word", "words", ],
        [ "word", ],
    ],
    "word": [
        [ "num-literal" ],
        [ "comparison-operator" ],
        [ "attribute-value-placeholder" ],
        [ "attribute-path-name" ],
        [ "comment-mark" ],
        [ "escaped-char" ],
        [ "string-literal" ],
        [ "block-comment" ],
        [ "line-comment" ],
        [ BNF.ident ],
        [ BNF.lex("PUNCT") ],
        [ BNF.strlitDQ ],
        [ BNF.strlitSQ ],
        [ BNF.lex("WS") ],
        [ BNF.lex("WS-LINCMT") ],
        [ BNF.lex("WS-BLKCMT") ],
    ],
    "num-literal": [
        [ "fractional-literal" ],
        [ "int-literal" ],
    ],
    "int-literal": [
        [ "dec-num-literal" ],
    ],
    "dec-num-literal": [
        [ "[sign]", BNF.lex("NUMLIT"), ],
    ],
    "sign": [
        [ BNF.literal("+") ],
        [ BNF.literal("-") ],
    ],
    "fractional-literal": [
        [ "[sign]", BNF.lex("NUMLIT"), "fractional-part" ],
    ],
    "fractional-part": [
        [ BNF.literal("."), BNF.lex("NUMLIT"), "[exp-part]", ],
    ],
    "exp-part": [
        [ BNF.literal("E"), "[sign]", BNF.lex("NUMLIT"), ],
        [ BNF.literal("e"), "[sign]", BNF.lex("NUMLIT"), ],
    ],
    "comparison-operator": [
        [ BNF.literal("<"), BNF.literal("=") ],
        [ BNF.literal("<"), BNF.literal(">") ],
        [ BNF.literal(">"), BNF.literal("=") ],
        [ BNF.literal(">"), ],
        [ BNF.literal("="), ],
        [ BNF.literal("<"), ],
    ],
    "attribute-value-placeholder": [
        [ BNF.literal(":"), BNF.ident ],
    ],
    "attribute-path-name": [
        [ BNF.ident, BNF.literal("."), "attribute-path-name" ],
        [ BNF.ident, BNF.literal("."), BNF.ident ],
    ],
    "block-comment":[
        [ BNF.literal("/*"), BNF.literalUntil("*/") ],
    ],
    "line-comment":[
        [ BNF.literal("//"), BNF.literalUntil("\n") ],
        [ BNF.literal("--"), BNF.literalUntil("\n") ],
    ],
    "comment-mark": [
        [ BNF.literal("/"), BNF.literal("*") ],
        [ BNF.literal("*"), BNF.literal("/") ],
        [ BNF.literal("/"), BNF.literal("/") ],
        [ BNF.literal("-"), BNF.literal("-") ],
    ],
    "escaped-char": [
        [ BNF.literal("\\"), BNF.literal("\\"), ],
        [ BNF.literal("\\"), BNF.literal("\""), ],
        [ BNF.literal("\\"), BNF.literal("'"), ],
    ],
    "string-literal": [
        [ "string-literal-dq" ],
        [ "string-literal-sq" ],
    ],
    "string-literal-dq": [
        [ BNF.literal('"'), "string-literal-dq-end" ],
    ],
    "string-literal-dq-end": [
        [ BNF.literalUntil('"') ],
        [ BNF.literal('"') ],
    ],
    "string-literal-sq": [
        [ BNF.literal("'"), "string-literal-sq-end" ],
    ],
    "string-literal-sq-end": [
        [ BNF.literalUntil("'") ],
        [ BNF.literal("'") ],
    ],
}, {
    "num-literal": "NUMLIT",
    "comparison-operator": "PUNCT",
    "attribute-value-placeholder": "IDENT",
    "attribute-path-name": "IDENT",
    "block-comment": "WS-BLKCMT",
    "line-comment": "WS-LINCMT",
    "comment-mark": "WS",
    "escaped-char": "PUNCT",
    "string-literal-dq": "STRLIT-DQ",
    "string-literal-sq": "STRLIT-SQ",
});
DynamoDbSqlishParser.bnfScan = new BNF("sqlish-scan", DynamoDbSqlishParser.BNF);
DynamoDbSqlishParser.bnfQuery = new BNF("sqlish-query", DynamoDbSqlishParser.BNF);
DynamoDbSqlishParser.bnfPutItem = new BNF("sqlish-put-item", DynamoDbSqlishParser.BNF);
DynamoDbSqlishParser.bnfSetItem = new BNF("sqlish-set-item", DynamoDbSqlishParser.BNF);
DynamoDbSqlishParser.bnfDeleteItem = new BNF("sqlish-delete-item", DynamoDbSqlishParser.BNF);
DynamoDbSqlishParser.bnfCreateTable = new BNF("sqlish-create-table", DynamoDbSqlishParser.BNF);
DynamoDbSqlishParser.bnfDeleteTable = new BNF("sqlish-delete-table", DynamoDbSqlishParser.BNF);
DynamoDbSqlishParser.bnfUpdateTable = new BNF("sqlish-update-table", DynamoDbSqlishParser.BNF);

DynamoDbSqlishParser.parse = function(source, bnf) {
    var tokens = BNF.tokenize(source, DynamoDbSqlishParser.WordBuilder);
    //var tokens = DynamoDbSqlishParser.WordBuilder.tokenize(source);
    if(tokens != null && !Array.isArray(tokens) && !tokens.match) {
        return tokens; // tokens is BNF.Result object.
    }
    tokens.forEach( token => {
        var term = token.getTerm();
        switch(token.getType()) {
        case "STRLIT-DQ":
            token.setTerm("\"" + unescapeDQ(term.replace(/^"(.*)"$/, "$1")) + "\"");
            break;
        case "STRLIT-SQ":
            token.setTerm("'" + unescapeSQ(term.replace(/^'(.*)'$/, "$1")) + "'");
            break;
        default:
            break;
        }
    });
    var result = bnf.parseTokens(tokens);
    return result;
};

function unescapeDQ(s) {
    s = strUnescape(s);
    var ss = "";
    var len = s.length;
    for(var i = 0; i < len; i++) {
        var c = s.charAt(i);
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
        if(c == "'") {
            ss += "\\'";
        } else {
            ss += c;
        }
    }
    return ss;
}

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

DynamoDbSqlishParser.parseCreateTable = function(source) {
    return DynamoDbSqlishParser.parse(source,
            DynamoDbSqlishParser.bnfCreateTable);
};
DynamoDbSqlishParser.parseDeleteTable = function(source) {
    return DynamoDbSqlishParser.parse(source,
            DynamoDbSqlishParser.bnfDeleteTable);
};
DynamoDbSqlishParser.parseUpdateTable = function(source) {
    return DynamoDbSqlishParser.parse(source,
            DynamoDbSqlishParser.bnfUpdateTable);
};
DynamoDbSqlishParser.parseScan = function(source) {
    return DynamoDbSqlishParser.parse(source,
            DynamoDbSqlishParser.bnfScan);
};
DynamoDbSqlishParser.parseQuery = function(source) {
    var result = DynamoDbSqlishParser.parse(source,
            DynamoDbSqlishParser.bnfQuery);
    return result;
};
DynamoDbSqlishParser.parsePutItem = function(source) {
    return DynamoDbSqlishParser.parse(source,
            DynamoDbSqlishParser.bnfPutItem);
};
DynamoDbSqlishParser.parseSetItem = function(source) {
    return DynamoDbSqlishParser.parse(source,
            DynamoDbSqlishParser.bnfSetItem);
};
DynamoDbSqlishParser.parseDeleteItem = function(source) {
    return DynamoDbSqlishParser.parse(source,
            DynamoDbSqlishParser.bnfDeleteItem);
};

module.exports = DynamoDbSqlishParser;
