"use strict";
var Statement = require('../lib/dynamodb-statement.js');
var DynamoDbReadItemStatement = require('../lib/dynamodb-read-item-statement.js');
var DynamoDbSqlishParser = require("../lib/dynamodb-sqlish-parser.js");
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
