"use strict";
var BNF = require("../lib/bnf.js");
var DynamoDbSqlishParser = require("../lib/dynamodb-sqlish-parser.js");
var Statement = require('../lib/dynamodb-statement.js');

function DynamoDbDeleteItemStatement(opt) {
    Statement.apply(this, Array.from(arguments));
    if(typeof(opt) === "string") {
        opt = DynamoDbDeleteItemStatement.parse(opt);
    }
    if(!("TableName" in opt)) {
        throw new Error("TableName required");
    }
    this.setTableName(opt.TableName);
    if("Key" in opt) {
        this.key = DynamoDbSqlishParser.parseItemListToMap(opt.Key);
    }
}

DynamoDbDeleteItemStatement.prototype = new Statement();

DynamoDbDeleteItemStatement.parse = function(sqlish) {
    var opt = {};
    var st = DynamoDbSqlishParser.parseDeleteItem(sqlish);

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

DynamoDbDeleteItemStatement.prototype.run = function(args, callback) {
    var param = this.getParameter(args);
    Statement.assertAllParamSpecified(param);
    this.dynamodb.deleteItem(param, callback);
};
DynamoDbDeleteItemStatement.prototype.getParameter = function(args) {
    var opt = Statement.prototype.getParameter.call(this, args);
    if(this.key) {
        opt.Key = this.key;
    }
    return opt;
};
module.exports = DynamoDbDeleteItemStatement;

