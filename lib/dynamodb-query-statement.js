"use strict";
const Statement = require('./dynamodb-statement.js');
const DynamoDbReadItemStatement = require('./dynamodb-read-item-statement.js');

/**
 * SQL-ish Query statement class for AWS DynamoDB.
 *
 * @param {string|object} opt
 * SQL-ish Query statement as string or parameter object for Query API.
 *
 * @constructor
 */
function DynamoDbQueryStatement(opt) {
    DynamoDbReadItemStatement.apply(this, Array.from(arguments));

    this.limit = null;
    this.exclusiveStartKey = null;
    this.projectionExpression = null;
    this.keyConditionExpression = null;
    this.filterExpression = null;

    this._callback = null;
    this._param = null;
    this._lastEvaluatedKey = null;

    if(!opt) {
        return;
    }
    if(typeof(opt) === "string") {
        opt = this.parse(opt);
    }
    if(!("TableName" in opt)) {
        throw new Error("TableName required");
    }
    if(!("KeyConditionExpression" in opt)) {
        throw new Error("KeyConditionExpression required");
    }
    this.setTableName(opt.TableName);
    this.setKeyConditionExpression(opt.KeyConditionExpression);
    if("FilterExpression" in opt) {
        this.setFilterExpression(opt.FilterExpression);
    }
    if("ProjectionExpression" in opt) {
        this.setProjectionExpression(opt.ProjectionExpression);
    }
    if("Limit" in opt) {
        this.setLimit(opt.Limit);
    }
    if("LastEvaluatedKey" in opt) {
        this.exclusiveStartKey = opt.LastEvaluatedKey;
    }
}

DynamoDbQueryStatement.prototype = new DynamoDbReadItemStatement();

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
DynamoDbQueryStatement.prototype.run = function(args, callback) {
    this._callback = callback || ( (/*err, data*/) => {/*none*/} );
    this._param = this.getParameter(args);
    this._query();
};

DynamoDbQueryStatement.prototype._query = function() {
    if(!this.dynamodb) {
        throw new Error("Could not run a statement. The API is not connected.");
    }
    Statement.assertAllParamSpecified(this._param);
    this.dynamodb.query(this._param, (err, data) => {
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
DynamoDbQueryStatement.prototype.next = function() {
    if(this._lastEvaluatedKey) {
        this._param.ExclusiveStartKey = this._lastEvaluatedKey;
        this._query();
    } else if(this._callback) {
        this._callback(null, null);
    }
};

/**
 * Clear the previous query setup.
 * Do not invoke next method after invoking this method.
 * @returns {undefined}
 */
DynamoDbQueryStatement.prototype.reset = function() {
    this._callback = null;
    this._param = null;
    this._lastEvaluatedKey = null;
};

/**
 * Parse the SQL-ish statement.
 * @param {string} sqlish SQL-ish statement
 * @returns {object} A parameter for DynamoDB query API.
 */
DynamoDbQueryStatement.prototype.parse = function(sqlish) {
    const opt = {};
    const st = this._parser.parseQuery(sqlish);

    const fromClause = st.getTerm("from-clause");
    if(!fromClause.match) {
        throw new Error("the from-clause not found");
    } else {
        opt.TableName = fromClause.getWordsList("table-name")[0].join("");
    }

    const whereClause = st.getTerm("where-key-clause");
    if(!whereClause.match) {
        throw new Error("the where clause not found");
    } else {
        opt.KeyConditionExpression =
            whereClause.getWordsList("condition-expression")[0].join(" ");
    }

    const selectClause = st.getTerm("select-clause");
    if(selectClause.match) {
        opt.ProjectionExpression =
            selectClause.getWordsList("key-list")[0].join("");
    }
    const filterClause = st.getTerm("filter-clause");
    if(filterClause.match) {
        opt.FilterExpression =
            filterClause.getWordsList("condition-expression")[0].join(" ");
    }
    const limitClause = st.getTerm("limit-clause");
    if(limitClause.match) {
        opt.Limit = limitClause.getWordsList("limit-count")[0].join(" ");
    }
    return opt;
};

/**
 * Get parameter to invoke the query API.
 * @param {object} args key-values for the expression to run the query.
 * @returns {object} A parameter for DynamoDB query API.
 */
DynamoDbQueryStatement.prototype.getParameter = function(args) {
    const opt = DynamoDbReadItemStatement.prototype.getParameter.call(this, args);
    if(this.keyConditionExpression) {
        opt.KeyConditionExpression = this.keyConditionExpression;
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
    return opt;
};

/**
 * Set KeyConditionExpression for query.
 * @param {string} keyConditionExpr expression
 * @returns {undefined}
 */
DynamoDbQueryStatement.prototype.setKeyConditionExpression = function(keyConditionExpr) {
    this.keyConditionExpression = this.parseConditionExpression( keyConditionExpr );
};

/**
 * Set FilterExpression for query.
 * @param {string} filterExpr expression
 * @returns {undefined}
 */
DynamoDbQueryStatement.prototype.setFilterExpression = function(filterExpr) {
    this.filterExpression = this.parseConditionExpression( filterExpr );
};

module.exports = DynamoDbQueryStatement;
