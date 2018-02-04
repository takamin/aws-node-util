"use strict";
var assert = require("chai").assert;
var Statement = require("../lib/dynamodb-statement");
var DynamoDbScanStatement = require('../lib/dynamodb-scan-statement.js');
var DynamoDbQueryStatement = require('../lib/dynamodb-query-statement.js');
describe("DynamoDB Statement", function() {
    describe("parseScanSQLish", function() {
        it("can parse SQL-ish that all clause is included", function() {
            var param = DynamoDbScanStatement.parse(
                "SELECT A, B, C \r\n" +
                "FROM TBL \n" +
                "WHERE F=FilterValue Limit\n" +
                "10");
            assert.equal("A,B,C", param.ProjectionExpression);
            assert.equal("TBL", param.TableName);
            assert.equal("F = FilterValue", param.FilterExpression);
            assert.equal("10", param.Limit);
        });
        it("can parse SQL-ish that does not have optional clause", function() {
            var param = DynamoDbScanStatement.parse(
                    " FROM TBL");
            assert.equal(false, "ProjectionExpression" in param);
            assert.equal("TBL", param.TableName);
            assert.equal(false, "FilterExpression" in param);
            assert.equal(false, "Limit" in param);
        });
        it("can parse SQL-ish that has various pattern", function() {
            var param = DynamoDbScanStatement.parse(
                    "  SELECT A,B,C FROM TBL Limit 10   ");
            assert.equal("A,B,C", param.ProjectionExpression);
            assert.equal("TBL", param.TableName);
            assert.equal(false, "FilterExpression" in param);
            assert.equal("10", param.Limit);
        });
        it("can parse SQL-ish that has various pattern", function() {
            var param = DynamoDbScanStatement.parse(
                    "FROM stars WHERE mainStar='SUN' AND orbitOrder BETWEEN 1 AND 9\n" +
                    "AND mass<1");
            assert.equal(false, "ProjectionExpression" in param);
            assert.equal("stars", param.TableName);
            assert.equal("mainStar = 'SUN' AND orbitOrder BETWEEN 1 AND 9 AND mass < 1",
                    param.FilterExpression);
            assert.equal(false, "Limit" in param);
        });
    });
    describe("parseQuerySQLish", function() {
        it("can parse SQL-ish that all clause is included", function() {
            var param = DynamoDbQueryStatement.parse(
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
            var param = DynamoDbQueryStatement.parse(
                    " FROM TBL WHERE Key=KeyValue ");
            assert.equal(false, "ProjectionExpression" in param);
            assert.equal("TBL", param.TableName);
            assert.equal("Key = KeyValue", param.KeyConditionExpression);
            assert.equal(false, "FilterExpression" in param);
            assert.equal(false, "Limit" in param);
        });
        it("can parse SQL-ish that has various pattern", function() {
            var param = DynamoDbQueryStatement.parse(
                    "  SELECT A,B,C FROM TBL WHERE Key = KeyValue Limit 10   ");
            assert.equal("A,B,C", param.ProjectionExpression);
            assert.equal("TBL", param.TableName);
            assert.equal("Key = KeyValue", param.KeyConditionExpression);
            assert.equal(false, "FilterExpression" in param);
            assert.equal("10", param.Limit);
        });
        it("can parse SQL-ish that has various pattern", function() {
            var param = DynamoDbQueryStatement.parse(
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
