"use strict";
var clone = require("clone");
var DynamoDbDataModels = require("../lib/dynamodb-data-models.js");
function Statement() {
    this.dynamodb;
    this.tableName = null;
    this.expressionAttributeNames = {};
    this.expressionAttributeValues = {};
}
Statement.prototype.run = function() {
    throw new Error("Fatal: run has no implementation");
};

Statement.setParam = function(param, args) {
    var param = clone(param);
    if("ExpressionAttributeValues" in param) {
        Object.keys(param.ExpressionAttributeValues).forEach(name => {
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
    };
};
module.exports = Statement;
