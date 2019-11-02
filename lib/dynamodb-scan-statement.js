"use strict";
const DynamoDbReadItemStatement = require('./dynamodb-read-item-statement.js');

/**
 * SQL-ish Scan statement class for AWS DynamoDB.
 *
 * create DynamoDbScanStatement.
 *
 * SQL-ish Syntax:
 *
 * ```
 * [SELECT <projection-expression>]
 * FROM <table-name>
 * [WHERE <filter-expression>]
 * [LIMIT <limit>]
 * ```
 *
 * * `[]` is representing that can be ommited.
 * * `<projection-expression>` - The comma separated attribute names to select.
 * * `<table-name>` - DynamoDB table name.
 * * `<filter-expression>` - Filtering conditional expression.
 * * `<limit>` - The number of items to scan.
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

    if(opt == null) {
        return;
    }

    if(typeof(opt) === "string") {
        opt = this.parse(opt);
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
        this.setExclusiveStartKey(opt.LastEvaluatedKey);
    }
}

DynamoDbScanStatement.prototype = new DynamoDbReadItemStatement();

/**
 * Parse the SQL-ish statement.
 * @param {string} sqlish SQL-ish statement
 * @returns {object} A parameter for DynamoDB scan API.
 */
DynamoDbScanStatement.prototype.parse = function(sqlish) {
    const opt = {};
    const st = this._parser.parseScan(sqlish);

    const fromClause = st.getTerm("from-clause");
    if(!fromClause.match) {
        throw new Error("the from-clause not found");
    } else {
        opt.TableName = fromClause.getWordsList("table-name")[0].join("");
    }

    const whereClause = st.getTerm("where-filter-clause");
    if(whereClause.match) {
        opt.FilterExpression =
            whereClause.getWordsList("condition-expression")[0].join(" ");
    }

    const selectClause = st.getTerm("select-clause");
    if(selectClause.match) {
        opt.ProjectionExpression =
            selectClause.getWordsList("key-list")[0].join("");
    }

    const limitClause = st.getTerm("limit-clause");
    if(limitClause.match) {
        opt.Limit = limitClause.getWordsList("limit-count")[0].join(" ");
    }
    return opt;
};

/**
 * Get parameter to invoke the scan API.
 * @param {object} args key-values for the expression to run the scan.
 * @returns {object} A parameter for DynamoDB scan API.
 */
DynamoDbScanStatement.prototype.getParameter = function(args) {
    const opt = DynamoDbReadItemStatement.prototype.getParameter.call(this, args);
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
 * Set FilterExpression for scan.
 * @param {string} filterExpr expression
 * @returns {undefined}
 */
DynamoDbScanStatement.prototype.setFilterExpression = function(filterExpr) {
    this.filterExpression = this.parseConditionExpression( filterExpr );
};

module.exports = DynamoDbScanStatement;
