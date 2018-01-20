#!/bin/env node
(function() {
    "use strict";
    var dynamodb = require("../lib/aws-dynamodb");
    var Statement = require("../lib/dynamodb-statement");
    var ResultSet = require("../lib/dynamodb-result-set");
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

    var statement = new Statement();
    var scanOpts = {};
    statement.setTableName(arg.tableName);
    statement.setLimit(maxItems);

    // projection expression
    var projexpr = getopt.options["projection-expression"];
    if(projexpr) {
        try {
            statement.setProjectionExpression(projexpr);
        } catch (err) {
            console.error("Error in projection-expression:", err.message);
            process.exit(1);
        }
    }

    // Filter expression
    if(getopt.options["filter-expression"]) {
        statement.setFilterExpression(getopt.options["filter-expression"]);
    }

    //
    // Scan
    //
    if(getopt.options["dry-run"]) {
        var scanParam = statement.getScanParameter();
        console.log("// opts for aws.dynamodb.scan:");
        console.log(JSON.stringify(scanParam, null, "    "));
        process.exit(0);
    } else {
        dynamodb.connect();
        dynamodb.runScanStatemnt(statement, function(err, data) {
            if(err) {
                console.error("Error:", err);
                process.exit(1);
            }
            if(getopt.options['output-json']) {
                console.log(JSON.stringify(data, null, "    "));
            } else if(getopt.options['output-json-oneline']) {
                console.log(JSON.stringify(data));
            } else {
                ResultSet.printScanResult(data, sortItemPath, sortDesc);
            }
        });
    }
}());

