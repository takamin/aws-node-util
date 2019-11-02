"use strict";
const assert = require("chai").assert;
const PutItemStatement = require("../lib/dynamodb-put-item-statement.js");
describe("DynamoDbPutItemStatement", () => {
    describe("constructor", () => {
        it("should not be thrown without parameter", () => {
            assert.doesNotThrow(()=>{
                new PutItemStatement();
            });
        })
    });
    describe("parse", () => {
        describe("without where-clause", () => {
            var param = (new PutItemStatement()).parse(
                "INSERT INTO T ( A,B,C ) VALUES (123.456,'2',true)");
            it("should parse the TableName", () => {
                assert.equal("T", param.TableName);
            });
            it("should parse the Item parameter", () => {
                assert.equal("A=123.456,B='2',C=true", param.Item);
            });
        });
        describe("with where-clause (ConditionExpression)", () => {
            describe("operators", () => {
                it("should parse partition key equality operator", () => {
                    var param = (new PutItemStatement()).parse([
                        "INSERT INTO T ( A,B,C ) VALUES (1,'2',true)",
                        "WHERE PK=:pk"].join(" "));
                    assert.equal(
                        "PK = :pk",
                        param.ConditionExpression);
                });
                it("should parse partition key equality operator", () => {
                    var param = (new PutItemStatement()).parse([
                        "INSERT INTO T ( A,B,C ) VALUES (1,'2',true)",
                        "WHERE PK=:pk AND SK BETWEEN :sk0 AND :sk1"
                        ].join(" "));
                    assert.equal(
                        "PK = :pk AND SK BETWEEN :sk0 AND :sk1",
                        param.ConditionExpression);
                });
                it("should parse begins_with function", () => {
                    var param = (new PutItemStatement()).parse([
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
    describe("getParameter", () => {
        var statement = new PutItemStatement([
            "INSERT INTO T ( NAME,TIMESTAMP,OBJECT ) VALUES ('MY NAME', 123.456, true)",
            "WHERE NAME=:NM AND TIMESTAMP=:TS AND OBJECT=:OB"].join(" "));
        var param = statement.getParameter({
            ":NM": "MY NAME", ":TS": 2, ":OB": true });
        it("should set Item", () => {
            assert.deepEqual({
                "NAME": { "S": "MY NAME" },
                "TIMESTAMP": { "N": "123.456" },
                "OBJECT": { "BOOL": true },
            }, param.Item);
        });
        it("should set ExpressionAttributeNames", () => {
            assert.deepEqual({
                "#NAME": "NAME",
                "#TIMESTAMP": "TIMESTAMP",
                "#OBJECT": "OBJECT",
            }, param.ExpressionAttributeNames);
        });
        it("should set ExpressionAttributeValues", () => {
            assert.deepEqual({
                ":NM": { "S": "MY NAME" },
                ":TS": { "N": "2" },
                ":OB": { "BOOL": "true" },
            }, param.ExpressionAttributeValues);
        });
    });
    describe("setValues", () => {
        it("should set the values by array of values", () => {
            let statement = new PutItemStatement(
                ["INSERT INTO stars (",
                    "mainStar, role, orbitOrder, name",
                ") VALUES (",
                    "'SUN', 'planet', 10, 'X'",
                ")"].join(" "));
            statement.setValues([ "EARTH", "none", 25, "Y" ]);
            let param = statement.getParameter({});
            assert.deepEqual({
                "TableName": "stars",
                "Item": {
                    "mainStar": { "S": "EARTH" },
                    "role": { "S": "none" },
                    "orbitOrder": { "N": "25" },
                    "name": { "S": "Y" }
                },
            }, param);
        });
        it("should set the values by key-value object", () => {
            let statement = new PutItemStatement(
                ["INSERT INTO stars (",
                    "mainStar, role, orbitOrder, name",
                ") VALUES (",
                    "'SUN', 'planet', 10, 'X'",
                ")"].join(" "));
            statement.setValues({
                mainStar: "EARTH",
                role: "none",
                orbitOrder: 25,
                name: "Y"
            });
            let param = statement.getParameter({});
            assert.deepEqual({
                "TableName": "stars",
                "Item": {
                    "mainStar": { "S": "EARTH" },
                    "role": { "S": "none" },
                    "orbitOrder": { "N": "25" },
                    "name": { "S": "Y" }
                },
            }, param);
        });
        it("should throw if the name does not exists in Item", () => {
            let statement = new PutItemStatement(
                ["INSERT INTO stars (",
                    "mainStar, role, orbitOrder, name",
                ") VALUES (",
                    "'SUN', 'planet', 10, 'X'",
                ")"].join(" "));
            assert.throws( () => {
                statement.setValues({
                    mainStera: "EARTH",
                });
            });
        });
    });
});

