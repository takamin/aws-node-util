"use strict";
const assert = require("chai").assert;
const DeleteItemStatement = require("../lib/dynamodb-delete-item-statement.js");
describe("DynamoDbDeleteItemStatement", () => {
    describe("constructor", () => {
        it("should not be thrown without parameter", () => {
            assert.doesNotThrow(()=>{
                new DeleteItemStatement();
            });
        })
    });
    describe("parse", () => {
        describe("without where-clause", () => {
            var param = (new DeleteItemStatement()).parse(
                "DELETE FROM T");
            it("should parse the TableName", () => {
                assert.equal("T", param.TableName);
            });
        });
        describe("with where-clause (Key)", () => {
            describe("operators", () => {
                it("should parse partition key equality operator", () => {
                    var param = (new DeleteItemStatement()).parse([
                        "DELETE FROM T",
                        "WHERE PK=1"].join(" "));
                    assert.equal(
                        "PK=1",
                        param.Key);
                });
                it("should parse partition key equality operator", () => {
                    var param = (new DeleteItemStatement()).parse([
                        "DELETE FROM T",
                        "WHERE PK='XXX' AND SK=1"
                        ].join(" "));
                    assert.equal(
                        "PK='XXX',SK=1",
                        param.Key);
                });
            });
        });
    });
});


