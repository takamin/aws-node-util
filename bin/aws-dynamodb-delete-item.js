#!/bin/env node
(function() {
    "use strict";
    var aws = require('../lib/awscli');
    //aws.setDebug();
    var dynamodb = require('../lib/aws-dynamodb');
    dynamodb.connect();
    var DynamoDB = aws.getService("DynamoDB");
    var parser = require('../lib/aws-dynamodb-expr-parsers');
    var getopt = require('node-getopt').create([
        ['j', 'output-json',            'output a json to read'],
        ['J', 'output-json-oneline',    'output a json in oneline'],
        ['h', 'help',                   'display this help']
        ]).bindHelp().parseSystem();
    var arg = require('hash-arg').get([
        "tableName",
        "key"
    ], getopt.argv);
    if(arg.tableName == null) {
        console.error("Error: tableName required");
        process.exit(1);
    }
    if(arg.key == null) {
        console.error("Error: key required");
        process.exit(1);
    }

    //
    // Options
    //
    var apiOpts = {};
    apiOpts["TableName"] = arg.tableName;
    try {
        apiOpts["Key"] = parser.parseItemListToMap(arg.key);
    } catch (err) {
        console.error("Error in parameter " + arg.key + ":", err.message);
        process.exit(1);
    }

    DynamoDB.deleteItem(apiOpts, function(err, data) {
        if(err) {
            console.error("Error:", err);
            process.exit(1);
        }
        if(getopt.options['output-json']) {
            console.log(JSON.stringify(data, null, "    "));
        } else if(getopt.options['output-json-oneline']) {
            console.log(JSON.stringify(data));
        }
    });
}());

