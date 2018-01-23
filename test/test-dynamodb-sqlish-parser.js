"use strict"
var BNF = require("../lib/bnf.js");

var SELECT = BNF.literal("SELECT");
var FROM = BNF.literal("FROM");
var WHERE = BNF.literal("WHERE");
var FILTER = BNF.literal("FILTER");
var LIMIT = BNF.literal("LIMIT");
var AND = BNF.literal("AND");
var OR = BNF.literal("OR");

var bnfQuery = new BNF("sqlish-query", {
    "sqlish-query": [
        [ "[select-clause]", "from-clause", "where-clause",
            "[filter-clause]", "[limit-clause]" ],
    ],
    "select-clause": [
        [ SELECT, "key-list" ]
    ],
    "key-list": [
        [ BNF.ident, BNF.comma, "key-list" ],
        [ BNF.ident ],
    ],
    "from-clause": [
        [ FROM, BNF.ident ],
    ],
    "where-clause": [
        [ WHERE, "condition-expression" ],
    ],
    "filter-clause": [
        [ FILTER, "condition-expression" ],
    ],
    "condition-expression" : [
        [ "and-expression", OR, "condition-expression" ],
        [ "and-expression" ],
    ],
    "and-expression" : [
        [ "compare-expression", AND, "and-expression" ],
        [ "compare-expression" ],
    ],
    "compare-expression": [
        [ BNF.ident, "compare-operator", "value" ],
        [ BNF.ident, BNF.literal("BETWEEN"), "between-range" ]
    ],
    "compare-operator": [
        [BNF.literal("=") ],
        [BNF.literal("<") ],
        [BNF.literal("<=") ],
        [BNF.literal(">") ],
        [BNF.literal(">=") ],
        [BNF.literal("<>") ],
    ],
    "between-range": [
        [ "value", AND, "value" ]
    ],
    "value": [
        [ BNF.numlit ],
        [ BNF.strlit ],
        [ BNF.ident ],
    ],
    "limit-clause": [
        [ LIMIT, BNF.numlit ]
    ]
});
var parseResult = bnfQuery.parse(
        "SELECT A,B,C FROM X " +
        "WHERE Y=0 OR Z BETWEEN 10 AND 19 " +
        "FILTER P >= 100 AND P <= 200 " +
        "LIMIT 20");
console.log(JSON.stringify(parseResult, null, "  "));
BNF.logResult(parseResult);

parseResult = bnfQuery.parse(
        "FROM X WHERE Y=0 OR Z BETWEEN 10 AND 19 ");
console.log(JSON.stringify(parseResult, null, "  "));
BNF.logResult(parseResult);
