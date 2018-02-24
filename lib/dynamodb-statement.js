"use strict";
var clone = require("clone");
var DynamoDbDataModels = require("../lib/dynamodb-data-models.js");
var parser = require('../lib/dynamodb-sqlish-parser');
function Statement() {
    this.dynamodb;
    this.tableName = null;
    this.expressionAttributeNames = {};
    this.expressionAttributeValues = {};
}
Statement.prototype.run = function() {
    throw new Error("Fatal: run has no implementation");
};

Statement.prototype.setTableName = function(tableName) {
    this.tableName = tableName;
};

Statement.prototype.parseConditionExpression = function(conditionExpr) {
    return parser.parseConditionExpression(
        conditionExpr,
        this.expressionAttributeNames,
        this.expressionAttributeValues);
};

Statement.prototype.getParameter = function(args) {
    var opt = {};
    if(this.tableName) {
        opt.TableName = this.tableName;
    }

    // Expression attribute names
    if(Object.keys(this.expressionAttributeNames).length > 0) {
        opt.ExpressionAttributeNames = this.expressionAttributeNames;
    }

    // Expression attribute values
    if(Object.keys(this.expressionAttributeValues).length > 0) {
        opt.ExpressionAttributeValues = this.expressionAttributeValues;
    }
    if(args) {
        opt = Statement.setParam(opt, args);
    }
    return opt;
};

Statement.setParam = function(param, args) {
    param = clone(param);
    if("ExpressionAttributeValues" in param) {
        Object.keys(param.ExpressionAttributeValues).forEach( name => {
            if(param.ExpressionAttributeValues[name] === null && name in args) {
                param.ExpressionAttributeValues[name] = DynamoDbDataModels.obj2map(args[name]);
            }
        });
    }
    return param;
};

Statement.assertAllParamSpecified = function(param) {
    if("ExpressionAttributeValues" in param) {
        Object.keys(param.ExpressionAttributeValues).forEach( name => {
            if(param.ExpressionAttributeValues[name] === null) {
                throw new Error("The parameter " + name + " is not specified");
            }
        });
    }
};
module.exports = Statement;
