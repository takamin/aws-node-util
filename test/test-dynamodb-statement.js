"use strict";
var assert = require("chai").assert;
var Statement = require("../lib/dynamodb-statement");
describe("DynamoDB Statement", function() {
    describe("parseScanSQLish", function() {
        it("can parse SQL-ish that all clause is included", function() {
            var param = Statement.parseScanSQLish(
                "SELECT A, B, C \r\n" +
                "FROM TBL \n" +
                "WHERE F=FilterValue Limit\n" +
                "10");
            assert.equal("A, B, C", param.ProjectionExpression);
            assert.equal("TBL", param.TableName);
            assert.equal("F=FilterValue", param.FilterExpression);
            assert.equal("10", param.Limit);
        });
        it("can parse SQL-ish that dose not have optional clause", function() {
            var param = Statement.parseScanSQLish(
                    " FROM TBL");
            assert.equal(false, "ProjectionExpression" in param);
            assert.equal("TBL", param.TableName);
            assert.equal(false, "FilterExpression" in param);
            assert.equal(false, "Limit" in param);
        });
        it("can parse SQL-ish that has various pattern", function() {
            var param = Statement.parseScanSQLish(
                    "  SELECT A,B,C FROM TBL Limit 10   ");
            assert.equal("A,B,C", param.ProjectionExpression);
            assert.equal("TBL", param.TableName);
            assert.equal(false, "FilterExpression" in param);
            assert.equal("10", param.Limit);
        });
        it("can parse SQL-ish that has various pattern", function() {
            var param = Statement.parseScanSQLish(
                    "FROM stars WHERE mainStar='SUN' AND orbitOrder BETWEEN 1 AND 9\n" +
                    "AND mass<1");
            assert.equal(false, "ProjectionExpression" in param);
            assert.equal("stars", param.TableName);
            assert.equal("mainStar='SUN' AND orbitOrder BETWEEN 1 AND 9 AND mass<1",
                    param.FilterExpression);
            assert.equal(false, "Limit" in param);
        });
    });
    describe("parseQuerySQLish", function() {
        it("can parse SQL-ish that all clause is included", function() {
            var param = Statement.parseQuerySQLish(
                "SELECT A, B, C \r\n" +
                "FROM TBL WHERE Key=KeyValue\n" +
                "FILTER F=FilterValue Limit\n" +
                "10");
            assert.equal("A, B, C", param.ProjectionExpression);
            assert.equal("TBL", param.TableName);
            assert.equal("Key=KeyValue", param.KeyConditionExpression);
            assert.equal("F=FilterValue", param.FilterExpression);
            assert.equal("10", param.Limit);
        });
        it("can parse SQL-ish that dose not have optional clause", function() {
            var param = Statement.parseQuerySQLish(
                    " FROM TBL WHERE Key=KeyValue ");
            assert.equal(false, "ProjectionExpression" in param);
            assert.equal("TBL", param.TableName);
            assert.equal("Key=KeyValue", param.KeyConditionExpression);
            assert.equal(false, "FilterExpression" in param);
            assert.equal(false, "Limit" in param);
        });
        it("can parse SQL-ish that has various pattern", function() {
            var param = Statement.parseQuerySQLish(
                    "  SELECT A,B,C FROM TBL WHERE Key = KeyValue Limit 10   ");
            assert.equal("A,B,C", param.ProjectionExpression);
            assert.equal("TBL", param.TableName);
            assert.equal("Key = KeyValue", param.KeyConditionExpression);
            assert.equal(false, "FilterExpression" in param);
            assert.equal("10", param.Limit);
        });
        it("can parse SQL-ish that has various pattern", function() {
            var param = Statement.parseQuerySQLish(
                    "FROM stars WHERE mainStar='SUN' AND orbitOrder BETWEEN 1 AND 9\n" +
                    "FILTER mass<1");
            assert.equal(false, "ProjectionExpression" in param);
            assert.equal("stars", param.TableName);
            assert.equal("mainStar='SUN' AND orbitOrder BETWEEN 1 AND 9",
                    param.KeyConditionExpression);
            assert.equal("mass<1", param.FilterExpression);
            assert.equal(false, "Limit" in param);
        });
    });
});
