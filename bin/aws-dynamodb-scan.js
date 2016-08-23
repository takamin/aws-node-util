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
        ['s', 'sort-item=ARG',     'JSON path to the sort item'],
        ['p', 'projection-expression=ARG', 'comma separated attribute names to project'],
        ['f', 'filter-expression=ARG',  'filter expression'],
        ['d', 'desc',                   'Sorting direction to descendent'],
        ['j', 'output-json',            'output a json to read'],
        ['J', 'output-json-oneline',    'output a json in oneline'],
        ['t', 'dry-run',                'Print options of the scan and exit'],
        ['h', 'help',                   'display this help']
        ]).bindHelp().parseSystem();
    var arg = require('hash-arg').get([
        "tableName"
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
    // Options
    //
    var projectionExpression = [];
    var filterExpression = "";
    var expressionAttributeNames = {};
    var expressionAttributeValues = {};

    //
    // projection expression
    //
    var projexpr = getopt.options["projection-expression"];
    if(projexpr) {
        scanOpts["ProjectionExpression"] = 
            dynamodb.parseProjectionExpression(
                    projexpr, expressionAttributeNames);
    }

    //
    // Filter expression
    //
    if(getopt.options["filter-expression"]) {
        scanOpts["FilterExpression"] = 
            dynamodb.parseConditionExpression(
                getopt.options["filter-expression"],
                expressionAttributeNames,
                expressionAttributeValues);
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
        console.log("// opts for aws.dynamodb.scan:");
        console.log(JSON.stringify(scanOpts, null, "    "));
        process.exit(0);
    }

    DynamoDB.scan(scanOpts,
    function(err, data) {
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

