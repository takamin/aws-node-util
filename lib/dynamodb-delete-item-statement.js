"use strict";
var Statement = require('./dynamodb-statement.js');

/**
 * SQL-ish DeleteItem statement class for AWS DynamoDB.
 *
 * create DynamoDbDeleteItemStatement.
 *
 * SQL-ish Syntax:
 *
 * ```
 * DELETE FROM <table-name>
 * [WHERE <key-condition-expression>]
 * ```
 *
 * * `[]` is representing that can be ommited.
 * * `<table-name>` - DynamoDB table name.
 * * `<key-condition-expression>` - Primary key conditional expression.
 *
 * @param {string|object} opt
 * SQL-ish DeleteItem statement as string or parameter object
 * for DeleteItem API.
 *
 * @constructor
 */
function DynamoDbDeleteItemStatement(opt) {
    Statement.apply(this, Array.from(arguments));
    this.key = {};
    if(!opt) {
        return;
    }
    if(typeof(opt) === "string") {
        opt = this.parse(opt);
    }
    if(!("TableName" in opt)) {
        throw new Error("TableName required");
    }
    this.setTableName(opt.TableName);
    if("Key" in opt) {
        this.key = this._parser.parseItemListToMap(opt.Key);
    }
}

DynamoDbDeleteItemStatement.prototype = new Statement();

DynamoDbDeleteItemStatement.prototype.parse = function(sqlish) {
    var opt = {};
    var st = this._parser.parseDeleteItem(sqlish);

    var tableName = st.getTerm("table-name");
    if(!tableName.match) {
        throw new Error("the table-name not found");
    }
    opt.TableName = st.getWordsList("table-name")[0].join("");

    var whereClause = st.getTerm("where-delete-key-clause");
    if(whereClause.match) {
        opt.Key =
            whereClause.getWordsList("compare-expression").map( expr => {
                if(expr.length !== 3 || expr[1] !== "=") {
                    throw new Error("Illegal key condition at where clause");
                }
                return expr.join("");
            }).join(",");
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
DynamoDbDeleteItemStatement.prototype.run = function(args, callback) {
    var param = this.getParameter(args);
    Statement.assertAllParamSpecified(param);
    this.dynamodb.deleteItem(param, callback);
};

/**
 * Get a parameter as a result of this statement instance.
 * It is available to execute the DynamoDB API.
 * @param {object} args K-V which is an attribute name to the value.
 * @returns {object} A parameter for the DynamoDB API.
 */
DynamoDbDeleteItemStatement.prototype.getParameter = function(args) {
    var opt = Statement.prototype.getParameter.call(this, args);
    if(this.key) {
        opt.Key = this.key;
    }
    return opt;
};
module.exports = DynamoDbDeleteItemStatement;
