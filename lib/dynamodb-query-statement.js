"use strict";
var Statement = require('../lib/dynamodb-statement.js');
var DynamoDbReadItemStatement = require('../lib/dynamodb-read-item-statement.js');
var DynamoDbSqlishParser = require("../lib/dynamodb-sqlish-parser.js");

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

    if(typeof(opt) === "string") {
        opt = DynamoDbQueryStatement.parse(opt);
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

DynamoDbQueryStatement.prototype.run = function(args, callback) {
    this._callback = callback || ( (err, data) => {/*none*/} );
    this._param = this.getParameter(args);
    Statement.assertAllParamSpecified(this._param);
    this.dynamodb.query(this._param, (err, data) => { this.callback(err, data); });
};

DynamoDbQueryStatement.prototype.callback = function(err, data) {
    if(data != null && "LastEvaluatedKey" in data) {
        this._lastEvaluatedKey = data.LastEvaluatedKey;
    } else {
        this._lastEvaluatedKey = null;
    }
    this._callback(err, data);
};

DynamoDbQueryStatement.prototype.next = function() {
    if(this._lastEvaluatedKey) {
        this._param.ExclusiveStartKey = this._lastEvaluatedKey;
        Statement.assertAllParamSpecified(this._param);
        this.dynamodb.query(this._param, (err, data) => { this.callback(err, data); });
    } else if(this._callback) {
        this._callback(null, null);
    }
};

DynamoDbQueryStatement.prototype.reset = function() {
    this._callback = null;
    this._param = null;
    this._lastEvaluatedKey = null;
};

DynamoDbQueryStatement.parse = function(sqlish) {
    var opt = {};
    var st = DynamoDbSqlishParser.parseQuery(sqlish);

    var fromClause = st.getTerm("from-clause");
    if(!fromClause.match) {
        throw new Error("the from-clause not found");
    } else {
        opt.TableName = fromClause.getWordsList("table-name")[0].join("");
    }

    var whereClause = st.getTerm("where-key-clause");
    if(!whereClause.match) {
        throw new Error("the where clause not found");
    } else {
        opt.KeyConditionExpression =
            whereClause.getWordsList("condition-expression")[0].join(" ");
    }

    var selectClause = st.getTerm("select-clause");
    if(selectClause.match) {
        opt.ProjectionExpression =
            selectClause.getWordsList("key-list")[0].join("");
    }
    var filterClause = st.getTerm("filter-clause");
    if(filterClause.match) {
        opt.FilterExpression =
            filterClause.getWordsList("condition-expression")[0].join(" ");
    }
    var limitClause = st.getTerm("limit-clause");
    if(limitClause.match) {
        opt.Limit = limitClause.getWordsList("limit-count")[0].join(" ");
    }
    return opt;
};

DynamoDbQueryStatement.prototype.getParameter = function(args) {
    var opt = DynamoDbReadItemStatement.prototype.getParameter.call(this, args);
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

DynamoDbQueryStatement.prototype.setKeyConditionExpression = function(keyConditionExpr) {
    this.keyConditionExpression = this.parseConditionExpression( keyConditionExpr );
};

DynamoDbQueryStatement.prototype.setFilterExpression = function(filterExpr) {
    this.filterExpression = this.parseConditionExpression( filterExpr );
};

module.exports = DynamoDbQueryStatement;
