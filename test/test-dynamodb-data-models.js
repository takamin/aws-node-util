"use strict";
var assert = require("chai").assert;
var DynamoDbDataModels = require("../lib/dynamodb-data-models");
describe("DynamoDbDataModels", function() {
    describe("obj2map", function() {
        it("should return String obj", function() {
            assert.deepEqual({"S":"ABC"}, DynamoDbDataModels.obj2map("ABC"));
        });
        it("should return Number obj", function() {
            assert.deepEqual({ "N": "1.23" }, DynamoDbDataModels.obj2map(1.23));
        });
        it("should return BOOL obj", function() {
            assert.deepEqual({ "BOOL": "true" }, DynamoDbDataModels.obj2map(true));
            assert.deepEqual({ "BOOL": "false" }, DynamoDbDataModels.obj2map(false));
        });
        it("should return Map obj", function() {
            assert.deepEqual({
                "M" : {
                    "A": {"S": "ABC" },
                    "B": {"N": "1.23" },
                    "C": {"BOOL": "true" }
                }
            },
            DynamoDbDataModels.obj2map({ A: "ABC", B: 1.23, C: true }));
        });
        it("should return List obj", function() {
            assert.deepEqual({
                "L" : [
                    {"S": "ABC" },
                    {"N": "1.23" },
                    {"BOOL": "true" }
                ]
            },
            DynamoDbDataModels.obj2map([ "ABC", 1.23, true ]));
        });
        it("should return StringSequence obj", function() {
            assert.deepEqual({
                "SS" : [ "ABC", "1.23", "true" ]
            },
            DynamoDbDataModels.obj2map([ "ABC", "1.23", "true" ]));
        });
        it("should return StringSequence obj", function() {
            assert.deepEqual({
                "NS" : [ "3", "2", "1", "0.5" ]
            },
            DynamoDbDataModels.obj2map([ 3, 2, 1, 0.5 ]));
        });
        it("should return BufferSequence obj", function() {
            assert.deepEqual({
                "BS" : [
                    Buffer.from([0,1,2]),
                    Buffer.from([3,4,5]),
                    Buffer.from([6,7,8])
                ]
            },
            DynamoDbDataModels.obj2map([
                    Buffer.from([0,1,2]),
                    Buffer.from([3,4,5]),
                    Buffer.from([6,7,8])
            ]));
        });
    });
    describe("map2obj", function() {
        it("should convert {S:'string'} to 'string':string", ()=>{
            var map = { item: {"S": "string"} };
            assert.deepEqual(
                {item:"string"},
                DynamoDbDataModels.map2obj(map));
        });
        it("should convert {N:'123'} to 123:number", ()=>{
            var map = { item: {"N": "123"} };
            assert.deepEqual(
                {item: 123},
                DynamoDbDataModels.map2obj(map));
        });
        it("should convert {BOOL:'true'} to true:boolean", ()=>{
            var map = { item: {"BOOL": "true"} };
            assert.deepEqual(
                {item: true},
                DynamoDbDataModels.map2obj(map));
        });
        it("should convert {BOOL:'false'} to false:boolean", ()=>{
            var map = { item: {"BOOL": "false"} };
            assert.deepEqual(
                {item: false},
                DynamoDbDataModels.map2obj(map));
        });
        it("should convert nested {M:{...}} to object", ()=>{
            var map = {
                item: {
                    "M": {
                        itemS: {"S": "string"},
                        itemN: {"N": "123"},
                        itemT: {"BOOL": "true"},
                        itemF: {"BOOL": "false"},
                        itemM: {
                            "M": {
                                itemS: {"S": "string"},
                                itemN: {"N": "123"},
                                itemT: {"BOOL": "true"},
                                itemF: {"BOOL": "false"},
                            },
                        }
                    }
                }
            };
            assert.deepEqual({item: {
                    itemS: "string",
                    itemN: 123,
                    itemT: true,
                    itemF: false,
                    itemM: {
                        itemS: "string",
                        itemN: 123,
                        itemT: true,
                        itemF: false,
                    }
                }},
                DynamoDbDataModels.map2obj(map));
        });
    });
});
