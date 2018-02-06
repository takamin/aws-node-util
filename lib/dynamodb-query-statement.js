"use strict";
var Statement = require('../lib/dynamodb-statement.js');
var DynamoDbReadItemStatement = require('../lib/dynamodb-read-item-statement.js');
var DynamoDbScanStatement = require('../lib/dynamodb-scan-statement.js');
var BNF = require("../lib/bnf.js");
var DynamoDbSqlishParser = require("../lib/dynamodb-sqlish-parser.js");

function DynamoDbQueryStatement(opt) {
    DynamoDbReadItemStatement.apply(this, Array.from(arguments));

    this.limit = null;
    this.exclusiveStartKey = null;
    this.projectionExpression = null;
    this.keyConditionExpression = null;
    this.filterExpression = null;

    if(typeof(opt) === "string") {
        opt = DynamoDbQueryStatement.parse(opt);
    }
    if(!("TableName" in opt)) {
        throw new Error("TableName required");
    }
    if(!("KeyConditionExpression" in opt)) {
        throw new Error("KeyConditionExpression required");
    }
    this.setTableName(opt.TableName);
    this.setKeyConditionExpression(opt.KeyConditionExpression);
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

DynamoDbQueryStatement.prototype = new DynamoDbReadItemStatement();

DynamoDbQueryStatement.prototype.run = function(args, callback) {
    var param = Statement.setParam(this.getParameter(args), args);
    Statement.assertAllParamSpecified(param);
    this.dynamodb.query(param, callback);
};

DynamoDbQueryStatement.parse = function(sqlish) {
    var opt = {};
    var st = DynamoDbSqlishParser.parseQuery(sqlish);

    var fromClause = st.getTerm("from-clause");
    if(!fromClause.match) {
        throw new Error("the from-clause not found");
    } else {
        var tableName = fromClause.getTerm("table-name");
        opt.TableName = tableName.getTermsList().join("");
    }

    var whereClause = st.getTerm("where-key-clause");
    if(!whereClause.match) {
        throw new Error("the where clause not found");
    } else {
        var keyCondExpr = whereClause.getTerm("condition-expression");
        opt.KeyConditionExpression = keyCondExpr.getTermsList().join(" ");
    }

    var selectClause = st.getTerm("select-clause");
    if(selectClause.match) {
        var selectKeyList = selectClause.getTerm("key-list");
        opt.ProjectionExpression = selectKeyList.getTermsList().join("");
    }
    var filterClause = st.getTerm("filter-clause");
    if(filterClause.match) {
        var filterCondExpr = filterClause.getTerm("condition-expression");
        opt.FilterExpression = filterCondExpr.getTermsList().join(" ");
    }
    var limitClause = st.getTerm("limit-clause");
    if(limitClause.match) {
        var limitCount = limitClause.getTerm("limit-count");
        opt.Limit = limitCount.getTermsList().join(" ");
    }
    return opt;
};

DynamoDbQueryStatement.prototype.getParameter = function() {
    var opt = {};
    if(this.tableName) {
        opt.TableName = this.tableName;
    }
    if(this.keyConditionExpression) {
        opt.KeyConditionExpression = this.keyConditionExpression;
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

DynamoDbQueryStatement.prototype.setKeyConditionExpression = function(keyConditionExpr) {
    this.keyConditionExpression = this.parseConditionExpression( keyConditionExpr );
};

DynamoDbQueryStatement.prototype.setFilterExpression = function(filterExpr) {
    this.filterExpression = this.parseConditionExpression( filterExpr );
};

module.exports = DynamoDbQueryStatement;
