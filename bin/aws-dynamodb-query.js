#!/bin/env node
"use strict";
var dynamodb = require("../lib/aws-dynamodb");
dynamodb.connect();

var Statement = require("../lib/dynamodb-statement.js");
var ResultSet = require("../lib/dynamodb-result-set");
var Getopt = require('node-getopt');
var optdef = new Getopt([
    ['c', 'max-items=ARG',          'The total number of items to return'],
    ['n', 'starting-token=ARG',     'A token to specify where to start paginating'],
    ['s', 'sort-item=ARG',          'JSON path to the sort item'],
    ['p', 'projection-expression=ARG', 'comma separated attribute names to project'],
    ['k', 'key-condition-expression=ARG',  'key condition expression of query'],
    ['f', 'filter-expression=ARG',  'filter expression applied after query'],
    ['d', 'desc',                   'Sorting direction to descendent'],
    ['j', 'output-json',            'output a json to read'],
    ['J', 'output-json-oneline',    'output a json in oneline'],
    ['t', 'dry-run',                'Print options of the query and exit'],
    ['q', 'sql-ish',                'Query by SQL-ish-statement(beta)'],
    ['p', 'placeholder-values=JSON','Placeholder values. specify as JSON'],
    ['h', 'help',                   'display this help']
    ]);

optdef.setHelp(
        "Usage:\n" +
        "1) aws-dynamodb-query [OPTIONS] <tableName> <keyConditionExpression>\n" +
        "2) aws-dynamodb-query [OPTIONS] -q <SQL-ish-statement>\n" +
        "\n" +
        "[[OPTIONS]]\n" +
        "\n" +
        "PARAMETERS:\n" +
        "\n" +
        "  tableName              The table name defined in DynamoDB.\n" +
        "  keyConditionExpression KeyConditionExpression for the DynamoDB table.\n" +
        "  SQL-ish-statement      SQL-ish text that represents a query\n" +
        "\n" +
        "  1) In all expression parameter, option value or SQL-ish," +
        "the field names could be represented as is for " +
        "its declared name in the table without considering " +
        "the placeholder of AWS DynamoDB.\n" +
        "\n" +
        "  2) Here is an examples showing a syntax for SQL-ish-statement of query.\n" +
        "\n" +
        "    [ SELECT <projection-expression> ]\n" +
        "    FROM <tableName>\n" +
        "    WHERE <keyConditionExpression>\n" +
        "    [ FILTER <filter-expression> ]\n" +
        "    [ LIMIT <max-items> ]\n" +
        "\n" +
        "  This says the FROM and WHERE clauses are mandatory and " +
        "the SELECT, FILTER and LIMIT are optional."
);
var getopt = optdef.bindHelp().parseSystem();

var arg = {};
if(getopt.options["sql-ish"]) {
    arg = require('hash-arg').get([ "sqlish" ], getopt.argv);
} else {
    arg = require('hash-arg').get([
        "tableName",
        "keyConditionExpression"
    ], getopt.argv);
}

try {

    var param;
    if(getopt.options["sql-ish"]) {
        param = arg.sqlish;
    } else {
        param = {
            TableName: null,
            KeyConditionExpression: null
        };

        // TableName
        if(!("tableName" in arg)) {
           console.error("Error:",
                   "tableName is required.");
           process.exit(1);
        }
        param.TableName = arg.tableName;

        // KeyConditionExpression
        var argExpr = arg.keyConditionExpression;
        var optExpr = getopt.options["key-condition-expression"];
        if(argExpr && optExpr) {
           console.error("Error:",
                   "Key condition expression is specified",
                   "at both command line and option.");
           process.exit(1);
        } else if(!argExpr && !optExpr) {
           console.error("Error:",
                   "The key condition expression is required.");
           process.exit(1);
        } else if(argExpr) {
           param.KeyConditionExpression = argExpr;
        } else if(optExpr) {
           param.KeyConditionExpression = optExpr;
        }

        // FilterExpression
        if("filter-expression" in getopt.options) {
            param.FilterExpression = getopt.options["filter-expression"];
        }

        // ProjectionExpression
        if("projection-expression" in getopt.options) {
            param.ProjectionExpression = getopt.options["projection-expression"];
        }

        // Limit
        if('max-items' in getopt.options) {
            param.Limit = parseInt(getopt.options['max-items']);
        }

        if('starting-token' in getopt.options) {
            // This parameter will be set to ExclusiveStartKey parameter of SCAN-API
            param.LastEvaluatedKey = JSON.parse(getopt.options['starting-token']);
        }
    }

    var statement = dynamodb.QueryStatement(param);
    var placeholderValues = {};
    if(getopt.options["placeholder-values"]) {
        placeholderValues = JSON.parse(getopt.options["placeholder-values"]);
    }
    if(getopt.options["dry-run"]) {
        var queryParam = statement.getParameter();
        queryParam = Statement.setParam(queryParam, placeholderValues);
        console.log("// opts for aws.dynamodb.query:");
        console.log(JSON.stringify(queryParam, null, "    "));
    } else {
        statement.run(placeholderValues, function(err, data) {
            if(err) {
                console.error("Error:", err);
                process.exit(1);
            }
            if(getopt.options['output-json']) {
                console.log(JSON.stringify(data, null, "    "));
            } else if(getopt.options['output-json-oneline']) {
                console.log(JSON.stringify(data));
            } else {
                ResultSet.printScanResult(data,
                        getopt.options['sort-item'],
                        getopt.options['desc']);
            }
        });
    }
} catch(err) {
    console.error("Error: ", err.message);
    process.exit(1);
}
