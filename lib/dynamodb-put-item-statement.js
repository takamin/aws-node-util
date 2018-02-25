"use strict";
var DynamoDbSqlishParser = require("../lib/dynamodb-sqlish-parser.js");
var Statement = require('../lib/dynamodb-statement.js');

/**
 * SQL-ish PutItem statement class for AWS DynamoDB.
 *
 * @param {string|object} opt
 * SQL-ish PutItem statement as string or parameter object
 * for PutItem API.
 *
 * @constructor
 */
function DynamoDbPutItemStatement(opt) {
    Statement.apply(this, Array.from(arguments));
    if(typeof(opt) === "string") {
        opt = DynamoDbPutItemStatement.parse(opt);
    }
    if(!("TableName" in opt)) {
        throw new Error("TableName required");
    }
    if(!("Item" in opt)) {
        throw new Error("Item required");
    }
    this.setTableName(opt.TableName);
    this.item = DynamoDbSqlishParser.parseItemListToMap(opt.Item);
    if("ConditionExpression" in opt) {
        this.conditionExpression =
            this.parseConditionExpression( opt.ConditionExpression );
    }
}

DynamoDbPutItemStatement.prototype = new Statement();

DynamoDbPutItemStatement.parse = function(sqlish) {
    var opt = {};
    var st = DynamoDbSqlishParser.parsePutItem(sqlish);

    var tableName = st.getTerm("table-name");
    if(!tableName.match) {
        throw new Error("the table-name not found");
    }
    opt.TableName = st.getWordsList("table-name")[0].join("");

    var attrNames =
        st.getTerm("attribute-list")
        .getWordsList("attribute-name")
        .map( (arr) => { return arr[0]; } );
    
    var values =
        st.getTerm("value-list")
        .getWordsList("value")
        .map( (arr) => { return arr[0]; } );

    if(attrNames.length != values.length) {
        throw new Error("the number of attribute names and values are not match.");
    }

    opt.Item = attrNames.map((name, index) => {
        return [name, values[index]].join("=");
    }).join(",");

    var whereClause = st.getTerm("where-key-clause");
    if(whereClause.match) {
        opt.ConditionExpression =
            whereClause.getWordsList("condition-expression")[0].join(" ");
    }

    return opt;
};


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
DynamoDbPutItemStatement.prototype.run = function(args, callback) {
    var param = this.getParameter(args);
    Statement.assertAllParamSpecified(param);
    this.dynamodb.putItem(param, callback);
};
DynamoDbPutItemStatement.prototype.getParameter = function(args) {
    var opt = Statement.prototype.getParameter.call(this, args);
    if(this.conditionExpression) {
        opt.ConditionExpression = this.conditionExpression;
    }
    if(this.item) {
        opt.Item = this.item;
    }
    return opt;
};
module.exports = DynamoDbPutItemStatement;
