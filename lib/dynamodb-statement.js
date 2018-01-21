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
};

Statement.parseScanSQLish = function(sqlish) {
    var opt = {};
    sqlish = sqlish.replace(/(\r|)\n/g, ' ');
    var matches = sqlish.match(/^\s*(SELECT\s+(.*)|)\s*(FROM\s+([^\s]+))\s*(.*)\s*$/i);
    if(matches && matches.length > 2 && matches[2]) {
        opt.ProjectionExpression = matches[2].replace(/^\s*/, "").replace(/\s*$/, "");
    }
    opt.TableName = matches[4];
    var whereFilterLimit = matches[5];
    if(whereFilterLimit.match(/WHERE/i)) {
        opt.KeyConditionExpression = whereFilterLimit.replace(/\s+WHERE\s.*$/i, "").replace(/^\s*/, "").replace(/\s*$/, "");
        if(whereFilterLimit.match(/LIMIT/i)) {
            opt.FilterExpression = whereFilterLimit.replace(/^.*\s*WHERE\s+(.*)\s+LIMIT\s+.*$/i, "$1");
            opt.Limit = whereFilterLimit.replace(/^.*\s*LIMIT\s+(\d*)\s*$/i, "$1");
        } else {
            opt.FilterExpression = whereFilterLimit.replace(/^.*\s*WHERE\s+(.*)\s*$/i, "$1");
        }
    } else if(whereFilterLimit.match(/LIMIT/i)) {
        opt.KeyConditionExpression = whereFilterLimit.replace(/\s+LIMIT\s*.*$/i, "").replace(/^\s*/, "").replace(/\s*$/, "");
        opt.Limit = whereFilterLimit.replace(/^.*\s*LIMIT\s+(\d*)\s*$/i, "$1");
    } else {
        opt.KeyConditionExpression = whereFilterLimit.replace(/\s+$/i, "").replace(/^\s*/, "");
    }
    return opt;

};

Statement.prepareScan = function(opt) {
    var statement = new Statement();
    if(typeof(opt) === "string") {
        opt = Statement.parseScanSQLish(opt);
    }
    if(!("TableName" in opt)) {
        throw new Error("TableName required");
    }
    statement.setTableName(opt.TableName);
    if("FilterExpression" in opt) {
        statement.setFilterExpression(opt.FilterExpression);
    }
    if("ProjectionExpression" in opt) {
        statement.setProjectionExpression(opt.ProjectionExpression);
    }
    if("Limit" in opt) {
        statement.setLimit(opt.Limit);
    }
    return statement;
};

Statement.parseQuerySQLish = function(sqlish) {
    var opt = {};
    sqlish = sqlish.replace(/(\r|)\n/g, ' ');
    var matches = sqlish.match(/^\s*(SELECT\s+(.*)|)\s*(FROM\s+(.*))\s+(WHERE\s+(.*))$/i);
    if(matches && matches.length > 2 && matches[2]) {
        opt.ProjectionExpression = matches[2].replace(/^\s*/, "").replace(/\s*$/, "");
    }
    opt.TableName = matches[4];
    var whereFilterLimit = matches[6];
    if(whereFilterLimit.match(/FILTER/i)) {
        opt.KeyConditionExpression = whereFilterLimit.replace(/\s+FILTER\s.*$/i, "").replace(/^\s*/, "").replace(/\s*$/, "");
        if(whereFilterLimit.match(/LIMIT/i)) {
            opt.FilterExpression = whereFilterLimit.replace(/^.*\s*FILTER\s+(.*)\s+LIMIT\s+.*$/i, "$1");
            opt.Limit = whereFilterLimit.replace(/^.*\s*LIMIT\s+(\d*)\s*$/i, "$1");
        } else {
            opt.FilterExpression = whereFilterLimit.replace(/^.*\s*FILTER\s+(.*)\s*$/i, "$1");
        }
    } else if(whereFilterLimit.match(/LIMIT/i)) {
        opt.KeyConditionExpression = whereFilterLimit.replace(/\s+LIMIT\s*.*$/i, "").replace(/^\s*/, "").replace(/\s*$/, "");
        opt.Limit = whereFilterLimit.replace(/^.*\s*LIMIT\s+(\d*)\s*$/i, "$1");
    } else {
        opt.KeyConditionExpression = whereFilterLimit.replace(/\s+$/i, "").replace(/^\s*/, "");
    }
    return opt;
};

Statement.prepareQuery = function(opt) {
    var statement = new Statement();
    if(typeof(opt) === "string") {
        opt = Statement.parseQuerySQLish(opt);
    }
    if(!("TableName" in opt)) {
        throw new Error("TableName required");
    }
    if(!("KeyConditionExpression" in opt)) {
        throw new Error("KeyConditionExpression required");
    }
    statement.setTableName(opt.TableName);
    statement.setKeyConditionExpression(opt.KeyConditionExpression);
    if("FilterExpression" in opt) {
        statement.setFilterExpression(opt.FilterExpression);
    }
    if("ProjectionExpression" in opt) {
        statement.setProjectionExpression(opt.ProjectionExpression);
    }
    if("Limit" in opt) {
        statement.setLimit(opt.Limit);
    }
    return statement;
};

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
