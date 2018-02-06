"use strict";
const assert = require("chai").assert;
const QueryStatement = require("../lib/dynamodb-query-statement.js");
describe("DynamoDbQueryStatement", () => {
    describe("parse", () => {
        describe("right syntax", () => {
            describe("normal description", () => {
                var param = QueryStatement.parse([
                    "SELECT A,B,C FROM T",
                    "WHERE PK = :pk AND",
                    "SK BETWEEN :sk0 AND sk1"].join(" "));
                it("should parse the SELECT clause certainly", () => {
                    assert.equal("A,B,C", param.ProjectionExpression);
                });
                it("should parse the FROM clause certainly", () => {
                    assert.equal("T", param.TableName);
                });
                it("should parse the operator BETWEEN in WHERE clause", () => {
                    assert.equal(
                        "PK = :pk AND SK BETWEEN :sk0 AND sk1",
                        param.KeyConditionExpression);
                });
            });
        });
        describe("WHERE clause (KeyConditionExpression)", () => {
            describe("operators", () => {
                it("should parse partition key equality operator", () => {
                    var param = QueryStatement.parse(
                        "SELECT A FROM T WHERE PK=:pk");
                    assert.equal(
                        "PK = :pk",
                        param.KeyConditionExpression);
                });
                it("should parse partition key equality operator", () => {
                    var param = QueryStatement.parse(["SELECT A FROM T",
                        "WHERE PK=:pk AND SK BETWEEN :sk0 AND :sk1"
                        ].join(" "));
                    assert.equal(
                        "PK = :pk AND SK BETWEEN :sk0 AND :sk1",
                        param.KeyConditionExpression);
                });
                it("should parse begins_with function", () => {
                    var param = QueryStatement.parse(["SELECT A FROM T",
                        "WHERE PK=:pk AND begins_with(SK,:sk0)"
                        ].join(" "));
                    assert.equal(
                        "PK = :pk AND begins_with ( SK , :sk0 )",
                        param.KeyConditionExpression);
                });
            });
        });
        describe("FILTER clause (FilterExpression)", () => {
            describe("bind with logical operator", () => {
                it("should parse A=1 AND B=2", () => {
                    var param = QueryStatement.parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER A=1 AND B=2"
                        ].join(" "));
                    assert.equal(
                        "A = 1 AND B = 2",
                        param.FilterExpression);
                });
                it("should parse A=1 AND B=2 AND C=3", () => {
                    var param = QueryStatement.parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER A=1 AND B=2 AND C=3"
                        ].join(" "));
                    assert.equal(
                        "A = 1 AND B = 2 AND C = 3",
                        param.FilterExpression);
                });
                it("should parse A=1 OR B=2", () => {
                    var param = QueryStatement.parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER A=1 OR B=2"
                        ].join(" "));
                    assert.equal(
                        "A = 1 OR B = 2",
                        param.FilterExpression);
                });
                it("should parse A=1 OR B=2 OR C=3", () => {
                    var param = QueryStatement.parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER A=1 OR B=2 OR C=3"
                        ].join(" "));
                    assert.equal(
                        "A = 1 OR B = 2 OR C = 3",
                        param.FilterExpression);
                });
            });
            describe("braces", () => {
                it("should parse (A=1 OR B=2) AND C=3", () => {
                    var param = QueryStatement.parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER (A=1 OR B=2) AND C=3"
                        ].join(" "));
                    assert.equal(
                        "( A = 1 OR B = 2 ) AND C = 3",
                        param.FilterExpression);
                });
                it("should parse A=1 OR (B=2 AND C=3)", () => {
                    var param = QueryStatement.parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER A=1 OR (B=2 AND C=3)"
                        ].join(" "));
                    assert.equal(
                        "A = 1 OR ( B = 2 AND C = 3 )",
                        param.FilterExpression);
                });
                it("should parse (A=1 AND B=2) OR C=3", () => {
                    var param = QueryStatement.parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER (A=1 AND B=2) OR C=3"
                        ].join(" "));
                    assert.equal(
                        "( A = 1 AND B = 2 ) OR C = 3",
                        param.FilterExpression);
                });
                it("should parse A=1 AND (B=2 OR C=3)", () => {
                    var param = QueryStatement.parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER A=1 AND (B=2 OR C=3)"
                        ].join(" "));
                    assert.equal(
                        "A = 1 AND ( B = 2 OR C = 3 )",
                        param.FilterExpression);
                });
            });
        });
    });
});
