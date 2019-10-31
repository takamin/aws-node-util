"use strict";
var assert = require("chai").assert;
var Statement = require("../lib/dynamodb-statement");
var DynamoDbQueryStatement = require('../lib/dynamodb-query-statement.js');
describe("DynamoDB Statement", function() {
    describe("setParam", () => {
        it("should set 1st placeholder values as string", () => {
            var statement = new DynamoDbQueryStatement(
                    "FROM stars WHERE mainStar=:mainStar AND orbitOrder BETWEEN 1 AND 9\n" +
                    "FILTER mass<1");
            var param = Statement.setParam(statement.getParameter(), {":mainStar": "SUN" });
            assert.deepEqual({"S":"SUN"}, param.ExpressionAttributeValues[":mainStar"]);
        });
        it("should set 2nd placeholder values as number", () => {
            var statement = new DynamoDbQueryStatement(
                    "FROM stars WHERE mainStar=:mainStar AND orbitOrder BETWEEN 1 AND :maxOrbitOrder\n" +
                    "FILTER mass<1");
            var param = Statement.setParam(statement.getParameter(), {":maxOrbitOrder": 9 });
            assert.deepEqual({"N":"9"}, param.ExpressionAttributeValues[":maxOrbitOrder"]);
        });
        it("should set 3rd placeholder values as number", () => {
            var statement = new DynamoDbQueryStatement(
                    "FROM stars WHERE mainStar=:mainStar AND orbitOrder BETWEEN 1 AND :maxOrbitOrder\n" +
                    "FILTER mass<:maxMass");
            var param = Statement.setParam(statement.getParameter(), {":maxMass": 1 });
            assert.deepEqual({"N":"1"}, param.ExpressionAttributeValues[":maxMass"]);
        });
    });
    describe("assertAllParamSpecified", () => {
        it("should be thrown when the parameter is not set", () => {
            var statement = new DynamoDbQueryStatement(
                    "FROM stars WHERE mainStar=:mainStar AND orbitOrder BETWEEN 1 AND :maxOrbitOrder\n" +
                    "FILTER mass<1");
            var param = Statement.setParam(statement.getParameter(), {":mainStar": "SUN", ":maxOrbitOrder": 9 });
            Statement.assertAllParamSpecified(param);
            assert(true);
        });
        it("should be thrown when the parameter is not set", () => {
            var statement = new DynamoDbQueryStatement(
                    "FROM stars WHERE mainStar=:mainStar AND orbitOrder BETWEEN 1 AND :maxOrbitOrder\n" +
                    "FILTER mass<1");
            var param = Statement.setParam(statement.getParameter(), {":mainStar": "SUN" });
            assert.throws(() => { Statement.assertAllParamSpecified(param); });
        });
        it("should be thrown when the parameter is not set", () => {
            var statement = new DynamoDbQueryStatement(
                    "FROM stars WHERE mainStar=:mainStar AND orbitOrder BETWEEN 1 AND :maxOrbitOrder\n" +
                    "FILTER mass<1");
            var param = Statement.setParam(statement.getParameter(), {":maxOrbitOrder": 9 });
            assert.throws(() => { Statement.assertAllParamSpecified(param); });
        });
    });
});
