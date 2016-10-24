#!/bin/env node
(function() {
    "use strict";
    var aws = require('../lib/awscli');
    var DynamoDB = aws.getService("DynamoDB");
    //aws.setDebug();
    var dynamodb = require('../lib/aws-dynamodb');
    var getopt = require('node-getopt').create([
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
        ['h', 'help',                   'display this help']
        ]).bindHelp().parseSystem();
    var arg = require('hash-arg').get([
        "tableName",
        "keyConditionExpression"
    ], getopt.argv);
    if(arg.tableName == null) {
        console.error("Error: tableName required");
        process.exit(1);
    }
    var maxItems = 20;
    if(getopt.options['max-items'] != null) {
        maxItems = parseInt(getopt.options['max-items']);
        if(isNaN(maxItems) || maxItems <= 0) {
            console.error("Error: invalid max-items", getopt.options['max-items']);
            process.exit(1);
        }
    }
    var startingToken = null;
    if(getopt.options['starting-token'] != null) {
        startingToken = getopt.options['starting-token'];
    }
    var sortItemPath = getopt.options['sort-item'];
    var sortDesc = getopt.options['desc'];

    var scanOpts = {};
    scanOpts["TableName"] = arg.tableName;
    scanOpts["Limit"] = maxItems;

    //
    // Extra options
    //
    var extraOptions = {};
    var projectionExpression = [];
    var filterExpression = "";
    var expressionAttributeNames = {};
    var expressionAttributeValues = {};
    var select = "ALL_ATTRIBUTES";

    //
    // projection expression
    //
    var projexpr = getopt.options["projection-expression"];
    if(projexpr) {
        try {
            scanOpts["ProjectionExpression"] =
                dynamodb.parseProjectionExpression(
                        projexpr, expressionAttributeNames);
            select = "ALL_PROJECTED_ATTRIBUTES";
        } catch (err) {
            console.error("Error in projection-expression:", err.message);
            process.exit(1);
        }
    }

    //
    // Query expression
    //
    (function() {
        var keyConditionExpr = null;
        var argExpr = arg.keyConditionExpression;
        var optExpr = getopt.options["key-condition-expression"];
        if(argExpr) {
           if(optExpr) {
               console.error("Error:",
                       "Key condition expression is specified",
                       "at both command line and option.");
               process.exit(1);
           }
           keyConditionExpr = argExpr;
        } else if(optExpr) {
           keyConditionExpr = optExpr;
        } else {
           console.error("Error:",
                   "The key condition expression is required.");
           process.exit(1);
        }
        try {
            scanOpts["KeyConditionExpression"] =
                dynamodb.parseConditionExpression(keyConditionExpr,
                    expressionAttributeNames, expressionAttributeValues);
        } catch (err) {
            console.error("Error in key-condition-expression:", err.message);
            process.exit(1);
        }
    }());

    //
    // Filter expression
    //
    if(getopt.options["filter-expression"]) {
        try {
            scanOpts["FilterExpression"] =
                dynamodb.parseConditionExpression(
                    getopt.options["filter-expression"],
                    expressionAttributeNames,
                    expressionAttributeValues);
        } catch (err) {
            console.error("Error in filter-expression:", err.message);
            process.exit(1);
        }
    }

    //
    // Expression attribute names
    //
    if(Object.keys(expressionAttributeNames).length > 0) {
        scanOpts["ExpressionAttributeNames"] =
            expressionAttributeNames;
    }

    //
    // Expression attribute values
    //
    if(Object.keys(expressionAttributeValues).length > 0) {
        scanOpts["ExpressionAttributeValues"] =
            expressionAttributeValues;
    }

    //
    // Dry-run Option
    //
    if(getopt.options["dry-run"]) {
        console.log("// opts for aws.dynamodb.query:");
        console.log(JSON.stringify(scanOpts, null, "    "));
        process.exit(0);
    }

    DynamoDB.query(scanOpts, function(err, data) {
        if(err) {
            console.error("Error:", err);
            process.exit(1);
        }
        if(getopt.options['output-json']) {
            console.log(JSON.stringify(data, null, "    "));
        } else if(getopt.options['output-json-oneline']) {
            console.log(JSON.stringify(data));
        } else {
            dynamodb.printScanResult(data, sortItemPath, sortDesc);
        }
    });
}());

