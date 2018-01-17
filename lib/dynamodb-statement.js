"use strict";
var aws = require('../lib/awscli');
var DynamoDB = aws.getService("DynamoDB");
var parser = require('../lib/aws-dynamodb-expr-parsers');
function Statement() {
    this.projectionExpression = null;
    this.keyConditionExpression = null;
    this.filterExpression = null;
    this.expressionAttributeNames = {};
    this.expressionAttributeValues = {};
}
Statement.prototype.setTableName = function(tableName) {
    this.tableName = tableName;
};
Statement.prototype.setLimit = function(limit) {
    this.limit = limit;
};
Statement.prototype.setProjectionExpression = function(projexpr) {
    try {
        this.projectionExpression =
            parser.parseProjectionExpression(
                    projexpr, this.expressionAttributeNames);
    } catch (err) {
        console.error("Error in projection-expression:", err.message);
        process.exit(1);
    }
};
Statement.prototype.setKeyConditionExpression = function(keyConditionExpr) {
    try {
        this.keyConditionExpression =
            parser.parseConditionExpression(keyConditionExpr,
                this.expressionAttributeNames,
                this.expressionAttributeValues);
    } catch (err) {
        console.error("Error in key-condition-expression:", err.message);
        process.exit(1);
    }
};
Statement.prototype.setFilterExpression = function(filterExpr) {
    try {
        this.filterExpression =
            parser.parseConditionExpression(
                filterExpr,
                this.expressionAttributeNames,
                this.expressionAttributeValues);
    } catch (err) {
        console.error("Error in filter-expression:", err.message);
        process.exit(1);
    }
}
Statement.prototype.getScanParameter = function() {
    var opt = {};
    if(this.tableName) {
        opt.TableName = this.tableName;
    }
    if(this.limit) {
        opt.Limit = this.limit;
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
Statement.prototype.getQueryParameter = function() {
    var opt = this.getScanParameter();
    if(this.keyConditionExpression) {
        opt.KeyConditionExpression = this.keyConditionExpression;
    }
    return opt;
};
Statement.prototype.scanAll = function(callback) {
    var parameter = this.getQueryParameter();
    DynamoDB.scan(parameter, callback);
};
Statement.prototype.queryAll = function(callback) {
    var parameter = this.getQueryParameter();
    DynamoDB.query(parameter, callback);
};

module.exports = Statement;
