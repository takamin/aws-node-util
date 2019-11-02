"use strict";
const Statement = require('./dynamodb-statement.js');
const DeleteItemStatement = require("./dynamodb-delete-item-statement.js");

function RunnableDeleteItemStatement() {
    DeleteItemStatement.apply(this, Array.from(arguments));
    this.dynamodb = null;
}

RunnableDeleteItemStatement.prototype = new DeleteItemStatement();

/**
 * Run the statement in async.
 *
 * @param {object} args
 * The parameter for this statement.
 * Currently, this parmeter is not used.
 *
 * @param {Function} callback
 * The callback function to get an error.
 * The declaration is (err) => { ... }.
 *
 * @returns {undefined}
 */
RunnableDeleteItemStatement.prototype.run = function(args, callback) {
    var param = this.getParameter(args);
    Statement.assertAllParamSpecified(param);
    this.dynamodb.deleteItem(param, callback);
};

module.exports = RunnableDeleteItemStatement;
