"use strict";
const assert = require("chai").assert;
const ScanStatement = require("../lib/dynamodb-scan-statement.js");
describe("DynamoDbScanStatement", () => {
    describe("parse", () => {
        it("can parse SQL-ish that all clause is included", function() {
            var param = ScanStatement.parse(
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
            var param = ScanStatement.parse(
                    " FROM TBL");
            assert.equal(false, "ProjectionExpression" in param);
            assert.equal("TBL", param.TableName);
            assert.equal(false, "FilterExpression" in param);
            assert.equal(false, "Limit" in param);
        });
        it("can parse SQL-ish that has various pattern", function() {
            var param = ScanStatement.parse(
                    "  SELECT A,B,C FROM TBL Limit 10   ");
            assert.equal("A,B,C", param.ProjectionExpression);
            assert.equal("TBL", param.TableName);
            assert.equal(false, "FilterExpression" in param);
            assert.equal("10", param.Limit);
        });
        it("can parse SQL-ish that has various pattern", function() {
            var param = ScanStatement.parse(
                    "FROM stars WHERE mainStar='SUN' AND orbitOrder BETWEEN 1 AND 9\n" +
                    "AND mass<1");
            assert.equal(false, "ProjectionExpression" in param);
            assert.equal("stars", param.TableName);
            assert.equal("mainStar = 'SUN' AND orbitOrder BETWEEN 1 AND 9 AND mass < 1",
                    param.FilterExpression);
            assert.equal(false, "Limit" in param);
        });
    });
});
