"use strict";
const assert = require("chai").assert;
const QueryStatement = require("../lib/dynamodb-query-statement.js");
describe("DynamoDbQueryStatement", () => {
    describe("constructor", () => {
        it("should not be thrown without parameter", () => {
            assert.doesNotThrow(()=>{
                new QueryStatement();
            });
        })
    });
    describe("parse", () => {
        describe("right syntax", () => {
            describe("normal description", () => {
                var param = (new QueryStatement()).parse([
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
                    var param = (new QueryStatement()).parse(
                        "SELECT A FROM T WHERE PK=:pk");
                    assert.equal(
                        "PK = :pk",
                        param.KeyConditionExpression);
                });
                it("should parse partition key equality operator", () => {
                    var param = (new QueryStatement()).parse(["SELECT A FROM T",
                        "WHERE PK=:pk AND SK BETWEEN :sk0 AND :sk1"
                        ].join(" "));
                    assert.equal(
                        "PK = :pk AND SK BETWEEN :sk0 AND :sk1",
                        param.KeyConditionExpression);
                });
                it("should parse begins_with function", () => {
                    var param = (new QueryStatement()).parse(["SELECT A FROM T",
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
                    var param = (new QueryStatement()).parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER A=1 AND B=2"
                        ].join(" "));
                    assert.equal(
                        "A = 1 AND B = 2",
                        param.FilterExpression);
                });
                it("should parse A=1 AND B=2 AND C=3", () => {
                    var param = (new QueryStatement()).parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER A=1 AND B=2 AND C=3"
                        ].join(" "));
                    assert.equal(
                        "A = 1 AND B = 2 AND C = 3",
                        param.FilterExpression);
                });
                it("should parse A=1 OR B=2", () => {
                    var param = (new QueryStatement()).parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER A=1 OR B=2"
                        ].join(" "));
                    assert.equal(
                        "A = 1 OR B = 2",
                        param.FilterExpression);
                });
                it("should parse A=1 OR B=2 OR C=3", () => {
                    var param = (new QueryStatement()).parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER A=1 OR B=2 OR C=3"
                        ].join(" "));
                    assert.equal(
                        "A = 1 OR B = 2 OR C = 3",
                        param.FilterExpression);
                });
                it("should parse attribute_exists function", () => {
                    var param = (new QueryStatement()).parse(["SELECT A FROM T",
                        "WHERE PK=:pk FILTER attribute_exists(path.to.attribute)"
                        ].join(" "));
                    assert.equal(
                        "attribute_exists ( path.to.attribute )",
                        param.FilterExpression);
                });
                it("should parse attribute_not_exists function", () => {
                    var param = (new QueryStatement()).parse(["SELECT A FROM T",
                        "WHERE PK=:pk FILTER attribute_not_exists(path.to.attribute)"
                        ].join(" "));
                    assert.equal(
                        "attribute_not_exists ( path.to.attribute )",
                        param.FilterExpression);
                });
                it("should parse attribute_type function", () => {
                    var param = (new QueryStatement()).parse(["SELECT A FROM T",
                        "WHERE PK=:pk FILTER attribute_type(path.to.attribute, S)"
                        ].join(" "));
                    assert.equal(
                        "attribute_type ( path.to.attribute , S )",
                        param.FilterExpression);
                });
                it("should parse begins_with function", () => {
                    var param = (new QueryStatement()).parse(["SELECT A FROM T",
                        "WHERE PK=:pk FILTER begins_with(path.to.attribute,:sk0)"
                        ].join(" "));
                    assert.equal(
                        "begins_with ( path.to.attribute , :sk0 )",
                        param.FilterExpression);
                });
                it("should parse contains function", () => {
                    var param = (new QueryStatement()).parse(["SELECT A FROM T",
                        "WHERE PK=:pk FILTER contains(path.to.attribute,:sk0)"
                        ].join(" "));
                    assert.equal(
                        "contains ( path.to.attribute , :sk0 )",
                        param.FilterExpression);
                });
                it("should parse size function", () => {
                    var param = (new QueryStatement()).parse(["SELECT A FROM T",
                        "WHERE PK=:pk FILTER size(path.to.attribute)"
                        ].join(" "));
                    assert.equal(
                        "size ( path.to.attribute )",
                        param.FilterExpression);
                });
            });
            describe("braces", () => {
                it("should parse (A=1 OR B=2) AND C=3", () => {
                    var param = (new QueryStatement()).parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER (A=1 OR B=2) AND C=3"
                        ].join(" "));
                    assert.equal(
                        "( A = 1 OR B = 2 ) AND C = 3",
                        param.FilterExpression);
                });
                it("should parse A=1 OR (B=2 AND C=3)", () => {
                    var param = (new QueryStatement()).parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER A=1 OR (B=2 AND C=3)"
                        ].join(" "));
                    assert.equal(
                        "A = 1 OR ( B = 2 AND C = 3 )",
                        param.FilterExpression);
                });
                it("should parse (A=1 AND B=2) OR C=3", () => {
                    var param = (new QueryStatement()).parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER (A=1 AND B=2) OR C=3"
                        ].join(" "));
                    assert.equal(
                        "( A = 1 AND B = 2 ) OR C = 3",
                        param.FilterExpression);
                });
                it("should parse A=1 AND (B=2 OR C=3)", () => {
                    var param = (new QueryStatement()).parse([
                        "SELECT A FROM T WHERE PK=:pk",
                        "FILTER A=1 AND (B=2 OR C=3)"
                        ].join(" "));
                    assert.equal(
                        "A = 1 AND ( B = 2 OR C = 3 )",
                        param.FilterExpression);
                });
            });
        });
        it("can parse SQL-ish that all clause is included", function() {
            var param = (new QueryStatement()).parse(
                "SELECT A, B, C \r\n" +
                "FROM TBL WHERE Key=KeyValue\n" +
                "FILTER F=FilterValue Limit\n" +
                "10");
            assert.equal("A,B,C", param.ProjectionExpression);
            assert.equal("TBL", param.TableName);
            assert.equal("Key = KeyValue", param.KeyConditionExpression);
            assert.equal("F = FilterValue", param.FilterExpression);
            assert.equal("10", param.Limit);
        });
        it("can parse SQL-ish that does not have optional clause", function() {
            var param = (new QueryStatement()).parse(
                    " FROM TBL WHERE Key=KeyValue ");
            assert.equal(false, "ProjectionExpression" in param);
            assert.equal("TBL", param.TableName);
            assert.equal("Key = KeyValue", param.KeyConditionExpression);
            assert.equal(false, "FilterExpression" in param);
            assert.equal(false, "Limit" in param);
        });
        it("can parse SQL-ish that has various pattern", function() {
            var param = (new QueryStatement()).parse(
                    "  SELECT A,B,C FROM TBL WHERE Key = KeyValue Limit 10   ");
            assert.equal("A,B,C", param.ProjectionExpression);
            assert.equal("TBL", param.TableName);
            assert.equal("Key = KeyValue", param.KeyConditionExpression);
            assert.equal(false, "FilterExpression" in param);
            assert.equal("10", param.Limit);
        });
        it("can parse SQL-ish that has various pattern", function() {
            var param = (new QueryStatement()).parse(
                    "FROM stars WHERE mainStar='SUN' AND orbitOrder BETWEEN 1 AND 9\n" +
                    "FILTER mass<1");
            assert.equal(false, "ProjectionExpression" in param);
            assert.equal("stars", param.TableName);
            assert.equal("mainStar = 'SUN' AND orbitOrder BETWEEN 1 AND 9",
                    param.KeyConditionExpression);
            assert.equal("mass < 1", param.FilterExpression);
            assert.equal(false, "Limit" in param);
        });
    });
});
