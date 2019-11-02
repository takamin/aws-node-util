"use strict";
const Statement = require('./dynamodb-statement.js');
const ScanStatement = require("./dynamodb-scan-statement.js");

function RunnableScanStatement() {
    ScanStatement.apply(this, Array.from(arguments));
    this.dynamodb = null;
    this._callback = null;
    this._param = null;
    this._lastEvaluatedKey = null;

}

RunnableScanStatement.prototype = new ScanStatement();

/**
 * Run the statement and notify its result to callback in async.
 *
 * If the Limit feature of the returning item count is used in the statement,
 * the `next()` method can be used in the callback to read next following items.
 *
 * @param {object} args
 * The parameter for this statement.
 * The key is a parameter name and must be an attribute
 * placeholder name starting with ':' that used in the statement.
 * Its value will be converted to the DynamoDB Map Object,
 * So you can set it as is.
 *
 * @param {Function} callback
 * The callback function to receive the result or an error.
 * The declaration is (err, result) => { ... }.
 * The result is an array of items.
 * The type of Item is the map of DynamoDB.
 *
 * @returns {undefined}
 */
RunnableScanStatement.prototype.run = function(args, callback) {
    this._callback = callback || ( (/*err, data*/) => {/*none*/} );
    this._param = this.getParameter(args);
    this._scan();
};

RunnableScanStatement.prototype._scan = function() {
    if(!this.dynamodb) {
        throw new Error("Could not run a statement. The API is not connected.");
    }
    Statement.assertAllParamSpecified(this._param);
    this.dynamodb.scan(this._param, (err, data) => {
        if(data != null && "LastEvaluatedKey" in data) {
            this._lastEvaluatedKey = data.LastEvaluatedKey;
        } else {
            this._lastEvaluatedKey = null;
        }
        this._callback(err, data);
    });
};

/**
 * Get next following items from inside of the callback function
 * of previous invoked run(). This method is available when the
 * limit feature was using.
 * The result also will be notified to the same callback.
 *
 * @returns {undefined}
 */
RunnableScanStatement.prototype.next = function() {
    if(this._lastEvaluatedKey) {
        this._param.ExclusiveStartKey = this._lastEvaluatedKey;
        this._scan();
    } else if(this._callback) {
        this._callback(null, null);
    }
};

/**
 * Clear the previous scan setup.
 * Do not invoke next method after invoking this method.
 * @returns {undefined}
 */
RunnableScanStatement.prototype.reset = function() {
    this._callback = null;
    this._param = null;
    this._lastEvaluatedKey = null;
};

module.exports = RunnableScanStatement;