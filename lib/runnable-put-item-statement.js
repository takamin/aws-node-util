"use strict";
const Statement = require('./dynamodb-statement.js');
const PutItemStatement = require("./dynamodb-put-item-statement.js");

function RunnablePutItemStatement() {
    PutItemStatement.apply(this, Array.from(arguments));
    this.dynamodb = null;
}

RunnablePutItemStatement.prototype = new PutItemStatement();

/**
 * Run the statement in async.
 *
 * @param {array|object} args
 * This parameter can be what is same to the parameter of `setValues`
 * method. If it is an array, it contains the values of attributes.
 * Or if it is an object, its key that do not start with ':'
 * represents the attribute names.
 *
 * @param {Function} callback
 * The callback function to get an error.
 * The declaration is (err) => { ... }.
 *
 * @returns {undefined}
 *
 * @see #setValues
 */
RunnablePutItemStatement.prototype.run = function(args, callback) {
    var argsClass = this.classifyValuesAndPlaceholders(args);
    let values = argsClass.values;
    let placeholders = argsClass.placeholders;

    if(values != null) {
        this.setValues(values);
    }
    var param = this.getParameter(placeholders);
    Statement.assertAllParamSpecified(param);
    this.dynamodb.putItem(param, callback);
};

RunnablePutItemStatement.prototype.classifyValuesAndPlaceholders = function(args) {
    let values = null;
    let placeholders = {};
    if(Array.isArray(args)) {
        values = args;
    } else if(typeof(args) === "object") {
        Object.keys(args).forEach( key => {
            if(key.match("^:")) {
                placeholders[key] = args[key];
            } else {
                if(values == null) {
                    values = {};
                }
                values[key] = args[key];
            }
        });
    }
    return { values: values, placeholders: placeholders };
};

module.exports = RunnablePutItemStatement;