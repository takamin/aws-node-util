"use strict";
var Statement = require('../lib/dynamodb-statement.js');
var parser = require('../lib/dynamodb-sqlish-parser');
function DynamoDbReadItemStatement() {
    Statement.apply(this, Array.from(arguments));
}
DynamoDbReadItemStatement.prototype = new Statement();

DynamoDbReadItemStatement.prototype.setLimit = function(limit) {
    this.limit = limit;
};

DynamoDbReadItemStatement.prototype.setExclusiveStartKey = function(lastEvaluatedKey) {
    this.exclusiveStartKey = lastEvaluatedKey;
};

DynamoDbReadItemStatement.prototype.setProjectionExpression = function(projexpr) {
    this.projectionExpression =
        parser.parseProjectionExpression(
                projexpr, this.expressionAttributeNames);
};

module.exports = DynamoDbReadItemStatement;
