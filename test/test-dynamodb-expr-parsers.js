"use strict";
var assert = require("chai").assert;
var dynamodb = require('../lib/aws-dynamodb');
describe("dynamodbExprParsers", function() {
    describe("parseProjectionExpression", function() {
        it("should parse non-keyword names", function() {
            var attrNames = {};
            var result = dynamodb.parseProjectionExpression(
                "A, B, C", attrNames);
            assert.equal("A , B , C", result);
            assert.deepEqual({}, attrNames);
        });
        it("should parse keyword names", function() {
            var attrNames = {};
            var result = dynamodb.parseProjectionExpression(
                "NAME,B,VALUE", attrNames);
            assert.equal("#NAME , B , #VALUE", result);
            assert.deepEqual({
                "#VALUE": "VALUE",
                "#NAME": "NAME",
            }, attrNames);
        });
    });
    describe("parseConditionExpression", function() {
        it("should parse number condition", function() {
            var attrNames = {};
            var attrValues = {};
            var result = dynamodb.parseConditionExpression(
                "A=99", attrNames, attrValues);
            assert.equal("A = :v0", result);
            assert.deepEqual({}, attrNames);
            assert.deepEqual({
                ":v0": { "N": "99" }
            }, attrValues);
        });
        it("should parse string quoted by single quotation", function() {
            var attrNames = {};
            var attrValues = {};
            var result = dynamodb.parseConditionExpression(
                "B='ABC'", attrNames, attrValues);
            assert.equal("B = :v0", result);
            assert.deepEqual({}, attrNames);
            assert.deepEqual({
                ":v0": { "S": "ABC" }
            }, attrValues);
        });
        it("should parse string quoted by double quotation", function() {
            var attrNames = {};
            var attrValues = {};
            var result = dynamodb.parseConditionExpression(
                "B=\"ABC\"", attrNames, attrValues);
            assert.equal("B = :v0", result);
            assert.deepEqual({}, attrNames);
            assert.deepEqual({
                ":v0": { "S": "ABC" },
            }, attrValues);
        });
        it("should not parse unclosed string quoted by single quotation", function() {
            var attrNames = {};
            var attrValues = {};
            try {
                var result = dynamodb.parseConditionExpression(
                    "B='ABC", attrNames, attrValues);
                    assert(false);
            } catch (err) {
                assert(true);
            }
        });
        it("should not parse unclosed string quoted by double quotation", function() {
            var attrNames = {};
            var attrValues = {};
            try {
                var result = dynamodb.parseConditionExpression(
                    "B=\"ABC", attrNames, attrValues);
                    assert(false);
            } catch (err) {
                assert(true);
            }
        });
        it("should parse boolean value true", function() {
            var attrNames = {};
            var attrValues = {};
            var result = dynamodb.parseConditionExpression(
                "C=true", attrNames, attrValues);
            assert.equal("C = :v0", result);
            assert.deepEqual({}, attrNames);
            assert.deepEqual({
                ":v0": { "BOOL": true }
            }, attrValues);
        });
        it("should parse boolean value false", function() {
            var attrNames = {};
            var attrValues = {};
            var result = dynamodb.parseConditionExpression(
                "C=false", attrNames, attrValues);
            assert.equal("C = :v0", result);
            assert.deepEqual({}, attrNames);
            assert.deepEqual({
                ":v0": { "BOOL": false }
            }, attrValues);
        });
        it("should not parse unidentified term", function() {
            var attrNames = {};
            var attrValues = {};
            try {
                var result = dynamodb.parseConditionExpression(
                    "C=UNIDENTIFIED", attrNames, attrValues);
                assert(false);
            } catch(err) {
                assert(true);
            }
        });
        it("should parse number value", function() {
            var attrNames = {};
            var attrValues = {};
            var result = dynamodb.parseConditionExpression(
                "A=99 AND B='ABC' OR C=true", attrNames, attrValues);
            assert.equal("A = :v0 AND B = :v1 OR C = :v2", result);
            assert.deepEqual({}, attrNames);
            assert.deepEqual({
                ":v0": { "N": "99" },
                ":v1": { "S": "ABC" },
                ":v2": { "BOOL": true },
            }, attrValues);
        });
        it("should parse keyword names", function() {
            var attrNames = {};
            var attrValues = {};
            var result = dynamodb.parseConditionExpression(
                "NAME=99 AND B='ABC' OR VALUE=true", attrNames, attrValues);
            assert.equal("#NAME = :v0 AND B = :v1 OR #VALUE = :v2", result);
            assert.deepEqual({
                "#NAME": "NAME",
                "#VALUE": "VALUE"
            }, attrNames);
            assert.deepEqual({
                ":v0": { N: "99" },
                ":v1": { S: "ABC" },
                ":v2": { BOOL: true },
            }, attrValues);
        });
        it("should parse keyword BETWEEN / AND", function() {
            var attrNames = {};
            var attrValues = {};
            var result = dynamodb.parseConditionExpression(
                "NAME BETWEEN 16 AND 64", attrNames, attrValues);
            assert.equal("#NAME BETWEEN :v0 AND :v1", result);
            assert.deepEqual({
                "#NAME": "NAME"
            }, attrNames);
            assert.deepEqual({
                ":v0": { N: "16" },
                ":v1": { N: "64" }
            }, attrValues);
        });
        it("should parse keyword IN for number option", function() {
            var attrNames = {};
            var attrValues = {};
            var result = dynamodb.parseConditionExpression(
                "VALUE IN (101,102,103)", attrNames, attrValues);
            assert.equal("#VALUE IN ( :v0 , :v1 , :v2 )", result);
            assert.deepEqual({
                "#VALUE": "VALUE"
            }, attrNames);
            assert.deepEqual({
                ":v0": { N: "101" },
                ":v1": { N: "102" },
                ":v2": { N: "103" }
            }, attrValues);
        });
        it("should parse keyword IN for string option", function() {
            var attrNames = {};
            var attrValues = {};
            var result = dynamodb.parseConditionExpression(
                "NAME IN ('X','Y','Z')", attrNames, attrValues);
            assert.equal("#NAME IN ( :v0 , :v1 , :v2 )", result);
            assert.deepEqual({
                "#NAME": "NAME"
            }, attrNames);
            assert.deepEqual({
                ":v0": { S: "X" },
                ":v1": { S: "Y" },
                ":v2": { S: "Z" }
            }, attrValues);
        });
    });
    describe("parseItemListToMap", function() {
        it("should convert object to MAP object", function() {
            var map = dynamodb.parseItemListToMap(
                ['id="123"',
                'timestamp=145678900',
                'test.name="foo"',
                'test.count=123',
                'test.pass=true',
                'test.fail=false',
                'value.version="0.6.6"'].join(','));
            assert.deepEqual({
                "id":       { "S": "123" },
                "timestamp":{ "N": "145678900" },
                "test": {
                    "M": {
                        "name": { "S": "foo" },
                        "count": { "N": "123" },
                        "pass": { "BOOL": true },
                        "fail": { "BOOL": false }
                    }
                },
                "value" : { "M" : { "version": { "S": "0.6.6" }}}
            }, map);
        });
        it("should throw error if it includes incomplete SQ string", function() {
            try {
            var map = dynamodb.parseItemListToMap(
                ['id="123"',
                'timestamp=145678900',
                'test.name=\'foo',
                'test.pass=true',
                'value.version="0.6.6"'].join(','));
                assert(false);
            } catch(err) {
                assert(true);
            }
        });
        it("should throw error if it includes incomplete DQ string", function() {
            try {
            var map = dynamodb.parseItemListToMap(
                ['id="123"',
                'timestamp=145678900',
                'test.name="foo',
                'test.pass=true',
                'value.version="0.6.6"'].join(','));
                assert(false);
            } catch(err) {
                assert(true);
            }
        });
        it("should throw error if it includes unidentified string", function() {
            try {
            var map = dynamodb.parseItemListToMap(
                ['id="123"',
                'timestamp=145678900',
                'test.name="foo"',
                'test.pass=notTrue',
                'value.version="0.6.6"'].join(','));
                assert(false);
            } catch(err) {
                assert(true);
            }
        });
    });
});
