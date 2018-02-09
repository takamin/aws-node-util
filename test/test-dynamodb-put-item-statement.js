"use strict";
const assert = require("chai").assert;
const PutItemStatement = require("../lib/dynamodb-put-item-statement.js");
describe("DynamoDbPutItemStatement", () => {
    describe("parse", () => {
        describe("without where-clause", () => {
            var param = PutItemStatement.parse(
                "INSERT INTO T ( A,B,C ) VALUES (1,'2',true)");
            it("should parse the TableName", () => {
                assert.equal("T", param.TableName);
            });
            it("should parse the Item parameter", () => {
                assert.equal("A=1,B='2',C=true", param.Item);
            });
        });
        describe("with where-clause (ConditionExpression)", () => {
            describe("operators", () => {
                it("should parse partition key equality operator", () => {
                    var param = PutItemStatement.parse([
                        "INSERT INTO T ( A,B,C ) VALUES (1,'2',true)",
                        "WHERE PK=:pk"].join(" "));
                    assert.equal(
                        "PK = :pk",
                        param.ConditionExpression);
                });
                it("should parse partition key equality operator", () => {
                    var param = PutItemStatement.parse([
                        "INSERT INTO T ( A,B,C ) VALUES (1,'2',true)",
                        "WHERE PK=:pk AND SK BETWEEN :sk0 AND :sk1"
                        ].join(" "));
                    assert.equal(
                        "PK = :pk AND SK BETWEEN :sk0 AND :sk1",
                        param.ConditionExpression);
                });
                it("should parse begins_with function", () => {
                    var param = PutItemStatement.parse([
                        "INSERT INTO T ( A,B,C ) VALUES (1,'2',true)",
                        "WHERE PK=:pk AND begins_with(SK,:sk0)"
                        ].join(" "));
                    assert.equal(
                        "PK = :pk AND begins_with ( SK , :sk0 )",
                        param.ConditionExpression);
                });
            });
        });
    });
});

