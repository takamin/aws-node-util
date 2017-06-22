#!/bin/env node
(function() {
    "use strict";
    var aws = require('../lib/awscli');
    var DynamoDB = aws.getService("DynamoDB");
    //aws.setDebug();
    var dynamodb = require('../lib/aws-dynamodb');
    var getopt = require('node-getopt').create([
        ['j', 'output-json',            'output a json to read'],
        ['J', 'output-json-oneline',    'output a json in oneline'],
        ['t', 'dry-run',                'Print options of the putItem and exit'],
        ['h', 'help',                   'display this help']
        ]).bindHelp().parseSystem();
    var arg = require('hash-arg').get([
        "string tableName",
        "string[] item"
    ], getopt.argv);
    if(arg.tableName == null) {
        console.error("Error: tableName is required.");
        process.exit(1);
    }
    if(arg.item == null || arg.item.length == 0) {
        console.error("Error: item is required to put.");
        process.exit(1);
    }
    arg.item.forEach(function(item) {
        var params = {};
        params["TableName"] = arg.tableName;
        try {
            params["Item"] = dynamodb.parseItemListToMap(item);
        } catch (err) {
            console.error("Error in parameter " + item + ":", err.message);
            process.exit(1);
        }

        //
        // Dry-run Option
        //
        if(getopt.options["dry-run"]) {
            console.log("// opts for aws.dynamodb.putItem:");
            console.log(JSON.stringify(params, null, "    "));
        } else {
            DynamoDB.putItem(params, function(err, data) {
                if(err) {
                    console.error("Error:", err);
                    process.exit(1);
                }
                if(getopt.options['output-json']) {
                    console.log(JSON.stringify(data, null, "    "));
                } else if(getopt.options['output-json-oneline']) {
                    console.log(JSON.stringify(data));
                } else {
                    console.log("putItem: ", JSON.stringify(params["Item"]));
                }
            });
        }
    });
}());


