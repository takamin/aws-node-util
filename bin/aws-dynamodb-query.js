#!/usr/bin/node
(function() {
    "use strict";
    var aws = require('../lib/awscli');
    //aws.setDebug();
    var dynamodb = require('../lib/aws-dynamodb');
    var getopt = require('node-getopt').create([
        ['c', 'max-items=ARG',          'The total number of items to return'],
        ['n', 'starting-token=ARG',     'A token to specify where to start paginating'],
        ['s', 'sort-item=ARG',          'JSON path to the sort item'],
        ['p', 'projection-expression=ARG', 'camma separated attribute names to project'],
        ['k', 'key-condition-expression=ARG',  'key condition expression of query'],
        ['f', 'filter-expression=ARG',  'filter expression applied after query'],
        ['d', 'desc',                   'Sorting direction to descendent'],
        ['j', 'output-json',            'output a json to read'],
        ['J', 'output-json-oneline',    'output a json in oneline'],
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
        extraOptions["projection-expression"] =
            dynamodb.parseProjectionExpression(
                    projexpr, expressionAttributeNames);
        select = "ALL_PROJECTED_ATTRIBUTES";
    }

    //
    // Query expression
    //
    if(getopt.options["key-condition-expression"]) {
        extraOptions["key-condition-expression"] =
            dynamodb.parseConditionExpression(
                getopt.options["key-condition-expression"],
                expressionAttributeNames,
                expressionAttributeValues);
    }

    //
    // Filter expression
    //
    if(getopt.options["filter-expression"]) {
        extraOptions["filter-expression"] =
            dynamodb.parseConditionExpression(
                getopt.options["filter-expression"],
                expressionAttributeNames,
                expressionAttributeValues);
    }

    //
    // Expression attribute names
    //
    if(Object.keys(expressionAttributeNames).length > 0) {
        extraOptions["expression-attribute-names"] =
            aws.jsonAsQuotedString(expressionAttributeNames);
    }

    //
    // Expression attribute values
    //
    if(Object.keys(expressionAttributeValues).length > 0) {
        extraOptions["expression-attribute-values"] =
            aws.jsonAsQuotedString(expressionAttributeValues);
    }

    dynamodb.query(arg.tableName, maxItems, startingToken, extraOptions,
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

