"use strict";
var clone = require("clone");
var DynamoDbDataModels = require("./dynamodb-data-models.js");
var parser = require('./dynamodb-sqlish-parser.js');

/**
 * Statement class
 * @constructor
 */
function Statement() {
    this._parser = parser;
    this.dynamodb = null;
    this.tableName = null;
    this.expressionAttributeNames = {};
    this.expressionAttributeValues = {};
}

/**
 * Run this statement.
 * @returns {undefined}
 */
Statement.prototype.run = function() {
    throw new Error("Fatal: run has no implementation");
};

/**
 * Set table name.
 * @param {string} tableName A table name
 * @returns {undefined}
 */
Statement.prototype.setTableName = function(tableName) {
    this.tableName = tableName;
};

/**
 * Parse ConditionExpression and translate the expr to use placeholders.
 * The attribute names or values are added to expressionAttributeNames/Values. 
 * @param {string} conditionExpr Expression
 * @returns {string} A translated expression. It might include placeholders.
 */
Statement.prototype.parseConditionExpression = function(conditionExpr) {
    return this._parser.parseConditionExpression(
        conditionExpr,
        this.expressionAttributeNames,
        this.expressionAttributeValues);
};

/**
 * Get a parameter as a result of this statement instance.
 * It is available to execute the DynamoDB API.
 * @param {object} args K-V which is an attribute name to the value.
 * @returns {object} A parameter for the DynamoDB API.
 */
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

/**
 * Set arguments to param.
 * @param {object} param API parameter
 * @param {object} args Key-Value. Attribute name to value.
 * @returns {object} result param. It is clone of the input param.
 */
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

/**
 * Assert that all attribute values are specified.
 * @param {object} param K-V which has an attribute name to the value
 * @returns {undefined}
 */
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
