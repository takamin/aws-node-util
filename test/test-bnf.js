"use strict";
var assert = require("chai").assert;
var BNF = require("../lib/bnf.js");
//BNF.setDebug(true);

describe("BNF", function() {

    var SELECT = BNF.literal("SELECT");
    var FROM = BNF.literal("FROM");
    var WHERE = BNF.literal("WHERE");
    var FILTER = BNF.literal("FILTER");
    var LIMIT = BNF.literal("LIMIT");
    var AND = BNF.literal("AND");
    var OR = BNF.literal("OR");
    var bnf = new BNF("sqlish-query", {
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
            [ BNF.strlitDQ ],
            [ BNF.strlitSQ ],
            [ BNF.ident ],
        ],
        "limit-clause": [
            [ LIMIT, BNF.numlit ]
        ]
    });
    describe("parse", function() {
        var result = bnf.parse(
            "FROM A WHERE B=0 AND C='DEF'");
        describe("result.term", function() {
            it("should has root BNF term", function() {
                assert.equal("sqlish-query", result.term);
            });
        });
        describe("result.lexCount", function() {
            it("should count lexical words", function() {
                assert.equal(10, result.lexCount);
            });
        });
        describe("result.match", function() {
            it("should set match", function() {
                assert.equal(10, result.lexCount);
            });
        });
        describe("result.terms", function() {
            it("should be array", function() {
                assert.equal(true, Array.isArray(result.terms));
            });
            it("should not be affected by source", function() {
                var sources = [
                    "FROM A WHERE B=0 AND C='DEF'",
                    "SELECT X,Y,Z FROM A WHERE B=0 AND C='DEF'",
                    "FROM A WHERE B=0 LIMIT 123"
                ];
                sources.forEach(function(source) {
                    var result = bnf.parse(source);
                    assert.equal(5, result.terms.length);
                    assert.equal("select-clause", result.getTerm("select-clause").term);
                    assert.equal("from-clause", result.getTerm("from-clause").term);
                    assert.equal("where-clause", result.getTerm("where-clause").term);
                    assert.equal("filter-clause", result.getTerm("filter-clause").term);
                    assert.equal("limit-clause", result.getTerm("limit-clause").term);
                });
            });
            it("should be set false to match property", function() {
                var result = bnf.parse("FROM A WHERE B=0 AND C='DEF'");
                assert.equal(false, result.existsTerm("select-clause"));
                assert.equal(true, result.existsTerm("from-clause"));
                assert.equal(true, result.existsTerm("where-clause"));
                assert.equal(false, result.existsTerm("filter-clause"));
                assert.equal(false, result.existsTerm("limit-clause"));
            });
            it("should be set valid information to optional term", function() {
                var result = bnf.parse("SELECT X,Y,Z FROM A WHERE B=0 AND C='DEF'");
                assert.equal(true, result.existsTerm("select-clause"));
                assert.equal(true, result.existsTerm("from-clause"));
                assert.equal(true, result.existsTerm("where-clause"));
                assert.equal(false, result.existsTerm("filter-clause"));
                assert.equal(false, result.existsTerm("limit-clause"));
            });
            it("should be set false to match property", function() {
                var result = bnf.parse("FROM A WHERE B=0 LIMIT 123");
                assert.equal(false, result.existsTerm("select-clause"));
                assert.equal(true, result.existsTerm("from-clause"));
                assert.equal(true, result.existsTerm("where-clause"));
                assert.equal(false, result.existsTerm("filter-clause"));
                assert.equal(true, result.existsTerm("limit-clause"));
            });
        });
    });
    describe("BNF.ParseResult", function() {
        describe("#existTerm", function() {
            it("should not recognize the select-clause term undescribed", function() {
                var result = bnf.parse("FROM A WHERE B=0 LIMIT 123");
                assert.equal(false, result.existsTerm("select-clause"));
            });
            it("should not recognize the filter-clause term undescribed", function() {
                var result = bnf.parse("FROM A WHERE B=0 LIMIT 123");
                assert.equal(false, result.existsTerm("filter-clause"));
            });
            it("should recognize the from-clause term described", function() {
                var result = bnf.parse("FROM A WHERE B=0 LIMIT 123");
                assert.equal(true, result.existsTerm("from-clause"));
            });
            it("should recognize the where-clause term described", function() {
                var result = bnf.parse("FROM A WHERE B=0 LIMIT 123");
                assert.equal(true, result.existsTerm("where-clause"));
            });
            it("should recognize the limit-clause term described", function() {
                var result = bnf.parse("FROM A WHERE B=0 LIMIT 123");
                assert.equal(true, result.existsTerm("limit-clause"));
            });
        });
        describe("#getTermsList", function() {
            it("should returns the tokens list of the select-clause", function() {
                var result = bnf.parse("SELECT X,Y,Z FROM A WHERE B=0 AND C='DEF'");
                assert.deepEqual(["X", ",", "Y", ",", "Z"],
                    result.getTerm("select-clause")
                        .getTerm("key-list").getTermsList());
            });
            it("should returns the tokens list of the from-clause", function() {
                var result = bnf.parse("SELECT X,Y,Z FROM A WHERE B=0 AND C='DEF'");
                assert.deepEqual(["FROM", "A"],
                    result.getTerm("from-clause").getTermsList());
            });
        });
    });
    describe("lexical analysis", function() {
        describe("unexpected termination error", function() {
            it("should be thrown for unterminated single-quoted string literal token", function() {
                try {
                    var result = bnf.parse("FROM A WHERE B=0 AND C='DEF");
                    assert.fail();
                } catch(err) {
                    assert.equal("unexpected terminate", err.message);
                }
            });
            it("should be thrown for unterminated double-quoted string literal token", function() {
                try {
                    var result = bnf.parse("FROM A WHERE B=0 AND C=\"DEF");
                    assert.fail();
                } catch(err) {
                    assert.equal("unexpected terminate", err.message);
                }
            });
            it("should be thrown for unterminated block comment token", function() {
                try {
                    var result = bnf.parse("FROM A WHERE B=0 AND C='DEF' /* ");
                    assert.fail();
                } catch(err) {
                    assert.equal("unexpected terminate", err.message);
                }
            });
            it("should NOT be thrown for terminating with identifier", function() {
                assert.doesNotThrow(() => {
                    var result = bnf.parse("FROM A WHERE B=0 AND C=DEF");
                });
            });
            it("should NOT be thrown for terminating with number literal", function() {
                assert.doesNotThrow(() => {
                    var result = bnf.parse("FROM A WHERE B=0 AND C=123");
                });
            });
            it("should NOT be thrown for terminating with whitespace", function() {
                assert.doesNotThrow(() => {
                    var result = bnf.parse("FROM A WHERE B=0 AND C=123 ");
                });
            });
            it("should NOT be thrown for terminating with punct", function() {
                assert.doesNotThrow(() => {
                    var result = bnf.parse("FROM A WHERE B=0 AND C=123;");
                });
            });
            it("should NOT be thrown for terminating in line comment", function() {
                assert.doesNotThrow(() => {
                    var result = bnf.parse("FROM A WHERE B=0 AND C='DEF' // /* ");
                });
            });
        });
    });
});
