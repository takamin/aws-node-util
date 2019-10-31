"use strict";
var Statement = require('./dynamodb-statement.js');

/**
 * An abstract base class for ScanStatement and QueryStatement.
 * @constructor
 */
function DynamoDbReadItemStatement() {
    Statement.apply(this, Array.from(arguments));
}

DynamoDbReadItemStatement.prototype = new Statement();

/**
 * Set LIMIT clause.
 * @param {number} limit A limit count to be read
 * @returns {undefined}
 */
DynamoDbReadItemStatement.prototype.setLimit = function(limit) {
    this.limit = limit;
};

/**
 * Set an exclusive start key that is used for `lastEvaluatedKey` parameter.
 * @param {string} lastEvaluatedKey A lastEvaluatedKey which was returned
 *  previous scan or query
 * @returns {undefined}
 */
DynamoDbReadItemStatement.prototype.setExclusiveStartKey = function(lastEvaluatedKey) {
    this.exclusiveStartKey = lastEvaluatedKey;
};

/**
 * Set ProjectionExpression.
 * @param {string} projexpr Comma separated attribute names to be selected
 * @returns {undefined}
 */
DynamoDbReadItemStatement.prototype.setProjectionExpression = function(projexpr) {
    this.projectionExpression =
        this._parser.parseProjectionExpression(
                projexpr, this.expressionAttributeNames);
};

module.exports = DynamoDbReadItemStatement;
