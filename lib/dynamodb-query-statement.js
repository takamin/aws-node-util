"use strict";
const DynamoDbReadItemStatement = require('./dynamodb-read-item-statement.js');

/**
 * SQL-ish Query statement class for AWS DynamoDB.
 *
 * SQL-ish Syntax:
 *
 * ```
 * [SELECT <projection-expression>]
 * FROM <table-name>
 * WHERE <key-condition-expression>
 * [FILTER <filter-expression>]
 * [LIMIT <limit>]
 * ```
 *
 * * `[]` is representing that can be ommited.
 * * `<projection-expression>` - The comma separated attribute names to select.
 * * `<table-name>` - DynamoDB table name.
 * * `<key-condition-expression>` - Primary key conditional expression.
 * * `<filter-expression>` - Filtering conditional expression.
 * * `<limit>` - The number of items to scan.
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
        this.setExclusiveStartKey(opt.LastEvaluatedKey);
    }
}

DynamoDbQueryStatement.prototype = new DynamoDbReadItemStatement();

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
