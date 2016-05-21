#!/usr/bin/node
(function() {
    "use strict";
    var aws = require('../lib/awscli');
    var DynamoDB = aws.getService("DynamoDB");
    //aws.setDebug();
    var dynamodb = require('../lib/aws-dynamodb');
    var getopt = require('node-getopt').create([
        ['j', 'output-json',            'output a json to read'],
        ['J', 'output-json-oneline',    'output a json in oneline'],
        ['h', 'help',                   'display this help']
        ]).bindHelp().parseSystem();
    var arg = require('hash-arg').get([
        "tableName",
        "item"
    ], getopt.argv);
    if(arg.tableName == null) {
        console.error("Error: tableName is required.");
        process.exit(1);
    }
    if(arg.item == null) {
        console.error("Error: item is required to put.");
        process.exit(1);
    }
    var params = {};
    params["TableName"] = arg.tableName;
    params["Item"] = dynamodb.parseItemListToMap(arg.item);
    DynamoDB.putItem(params,
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
            console.log("OK.");
        }
    });
}());


