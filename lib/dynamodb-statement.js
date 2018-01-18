"use strict";
var parser = require('../lib/aws-dynamodb-expr-parsers');
function Statement() {
    this.tableName = null;
    this.limit = null;
    this.exclusiveStartKey = null;
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
Statement.prototype.setExclusiveStartKey = function(lastEvaluatedKey) {
    this.exclusiveStartKey = lastEvaluatedKey;
};
Statement.prototype.setProjectionExpression = function(projexpr) {
    this.projectionExpression =
        parser.parseProjectionExpression(
                projexpr, this.expressionAttributeNames);
};
Statement.prototype.setKeyConditionExpression = function(keyConditionExpr) {
    this.keyConditionExpression =
        parser.parseConditionExpression(keyConditionExpr,
            this.expressionAttributeNames,
            this.expressionAttributeValues);
};
Statement.prototype.setFilterExpression = function(filterExpr) {
    this.filterExpression =
        parser.parseConditionExpression(
            filterExpr,
            this.expressionAttributeNames,
            this.expressionAttributeValues);
}
Statement.prototype.getScanParameter = function() {
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
Statement.prototype.getQueryParameter = function() {
    var opt = this.getScanParameter();
    if(this.keyConditionExpression) {
        opt.KeyConditionExpression = this.keyConditionExpression;
    }
    return opt;
};

module.exports = Statement;
