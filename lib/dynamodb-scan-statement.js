"use strict";
var Statement = require('../lib/dynamodb-statement.js');
var DynamoDbReadItemStatement = require('../lib/dynamodb-read-item-statement.js');
var DynamoDbSqlishParser = require("../lib/dynamodb-sqlish-parser.js");

/**
 * SQL-ish Scan statement class for AWS DynamoDB.
 *
 * @param {string|object} opt
 * SQL-ish Scan statement as string or parameter object for Scan API.
 *
 * @constructor
 */
function DynamoDbScanStatement(opt) {
    DynamoDbReadItemStatement.apply(this, Array.from(arguments));

    this.limit = null;
    this.exclusiveStartKey = null;
    this.projectionExpression = null;
    this.keyConditionExpression = null;
    this.filterExpression = null;

    this._callback = null;
    this._param = null;
    this._lastEvaluatedKey = null;

    if(opt == null) {
        return;
    }

    if(typeof(opt) === "string") {
        opt = DynamoDbScanStatement.parse(opt);
    }
    if(!("TableName" in opt)) {
        throw new Error("TableName required");
    }
    this.setTableName(opt.TableName);
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

DynamoDbScanStatement.prototype = new DynamoDbReadItemStatement();

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
DynamoDbScanStatement.prototype.run = function(args, callback) {
    this._callback = callback || ( (/*err, data*/) => {/*none*/} );
    this._param = this.getParameter(args);
    Statement.assertAllParamSpecified(this._param);
    this.dynamodb.scan(this._param, (err, data) => { this.callback(err, data); });
};

DynamoDbScanStatement.prototype.callback = function(err, data) {
    if(data != null && "LastEvaluatedKey" in data) {
        this._lastEvaluatedKey = data.LastEvaluatedKey;
    } else {
        this._lastEvaluatedKey = null;
    }
    this._callback(err, data);
};

/**
 * Get next items after previous called `run()`.
 * This method can be used from the callback.
 * The result will be notified to the same callback.
 *
 * @returns {undefined}
 */
DynamoDbScanStatement.prototype.next = function() {
    if(this._lastEvaluatedKey) {
        this._param.ExclusiveStartKey = this._lastEvaluatedKey;
        Statement.assertAllParamSpecified(this._param);
        this.dynamodb.scan(this._param, (err, data) => { this.callback(err, data); });
    } else if(this._callback) {
        this._callback(null, null);
    }
};

DynamoDbScanStatement.prototype.reset = function() {
    this._callback = null;
    this._param = null;
    this._lastEvaluatedKey = null;
};

DynamoDbScanStatement.parse = function(sqlish) {
    var opt = {};
    var st = DynamoDbSqlishParser.parseScan(sqlish);

    var fromClause = st.getTerm("from-clause");
    if(!fromClause.match) {
        throw new Error("the from-clause not found");
    } else {
        opt.TableName = fromClause.getWordsList("table-name")[0].join("");
    }

    var whereClause = st.getTerm("where-filter-clause");
    if(whereClause.match) {
        opt.FilterExpression =
            whereClause.getWordsList("condition-expression")[0].join(" ");
    }

    var selectClause = st.getTerm("select-clause");
    if(selectClause.match) {
        opt.ProjectionExpression =
            selectClause.getWordsList("key-list")[0].join("");
    }

    var limitClause = st.getTerm("limit-clause");
    if(limitClause.match) {
        opt.Limit = limitClause.getWordsList("limit-count")[0].join(" ");
    }
    return opt;
};

DynamoDbScanStatement.prototype.getParameter = function(args) {
    var opt = DynamoDbReadItemStatement.prototype.getParameter.call(this, args);
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

DynamoDbScanStatement.prototype.setFilterExpression = function(filterExpr) {
    this.filterExpression = this.parseConditionExpression( filterExpr );
};

module.exports = DynamoDbScanStatement;
