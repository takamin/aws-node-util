"use strict";
var Statement = require('../lib/dynamodb-statement.js');
var DynamoDbReadItemStatement = require('../lib/dynamodb-read-item-statement.js');
var BNF = require("../lib/bnf.js");
var DynamoDbSqlishParser = require("../lib/dynamodb-sqlish-parser.js");
function DynamoDbScanStatement(opt) {
    DynamoDbReadItemStatement.apply(this, Array.from(arguments));

    this.limit = null;
    this.exclusiveStartKey = null;
    this.projectionExpression = null;
    this.keyConditionExpression = null;
    this.filterExpression = null;

    if(opt == null) {
        return;
    }

    if(typeof(opt) === "string") {
        opt = DynamoDbScanStatement.parse(opt);
    }
    if(!("TableName" in opt)) {
        throw new Error("TableName required");
    }
    this.setTableName(opt.TableName);
    if("FilterExpression" in opt) {
        this.setFilterExpression(opt.FilterExpression);
    }
    if("ProjectionExpression" in opt) {
        this.setProjectionExpression(opt.ProjectionExpression);
    }
    if("Limit" in opt) {
        this.setLimit(opt.Limit);
    }
}

DynamoDbScanStatement.prototype = new DynamoDbReadItemStatement();

DynamoDbScanStatement.prototype.run = function(args, callback) {
    var param = Statement.setParam(this.getParameter(), args);
    Statement.assertAllParamSpecified(param);
    this.dynamodb.scan(param, callback);
};

DynamoDbScanStatement.parse = function(sqlish) {
    var opt = {};
    var st = DynamoDbSqlishParser.parseScan(sqlish);

    var fromClause = st.getTerm("from-clause");
    if(!fromClause.match) {
        throw new Error("the from-clause not found");
    } else {
        var tableName = fromClause.getTerm("table-name");
        opt.TableName = tableName.getTermsList().join("");
    }

    var whereClause = st.getTerm("where-clause");
    if(whereClause.match) {
        var keyCondExpr = whereClause.getTerm("condition-expression");
        opt.FilterExpression = keyCondExpr.getTermsList().join(" ");
    }

    var selectClause = st.getTerm("select-clause");
    if(selectClause.match) {
        var selectKeyList = selectClause.getTerm("key-list");
        opt.ProjectionExpression = selectKeyList.getTermsList().join("");
    }

    var limitClause = st.getTerm("limit-clause");
    if(limitClause.match) {
        var limitCount = limitClause.getTerm("limit-count");
        opt.Limit = limitCount.getTermsList().join(" ");
    }
    return opt;
};

DynamoDbScanStatement.prototype.getParameter = function() {
    var opt = {};
    if(this.tableName) {
        opt.TableName = this.tableName;
    }
    if(this.limit) {
        opt.Limit = this.limit;
    }
    if(this.exclusiveStartKey) {
        opt.ExclusiveStartKey = this.exclusiveStartKey;
    }
    if(this.projectionExpression) {
        opt.ProjectionExpression = this.projectionExpression;
    }
    if(this.filterExpression) {
        opt.FilterExpression = this.filterExpression;
    }

    // Expression attribute names
    if(Object.keys(this.expressionAttributeNames).length > 0) {
        opt.ExpressionAttributeNames = this.expressionAttributeNames;
    }

    // Expression attribute values
    if(Object.keys(this.expressionAttributeValues).length > 0) {
        opt.ExpressionAttributeValues = this.expressionAttributeValues;
    }
    return opt;
};

DynamoDbScanStatement.prototype.setFilterExpression = function(filterExpr) {
    this.filterExpression = this.parseConditionExpression( filterExpr );
};

module.exports = DynamoDbScanStatement;
