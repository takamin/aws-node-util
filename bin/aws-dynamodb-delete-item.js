#!/bin/env node
"use strict";
const awscli = require("../lib/awscli.js");
const DynamoDBDeleteStatement = require("../lib/dynamodb-delete-statement.js");

var getopt = require('node-getopt').create([
    ['j', 'output-json',            'output a json to read'],
    ['J', 'output-json-oneline',    'output a json in oneline'],
    ['t', 'dry-run',                'Print options of the deleteItem and exit'],
    ['q', 'sql-ish',                'Query by SQL-ish-statement(beta)'],
    ['p', 'placeholder-values=JSON','Placeholder values. specify as JSON'],
    ['h', 'help',                   'display this help']
    ]).bindHelp().parseSystem();
var param = null;
var placeholderValues = {};
if(getopt.options["sql-ish"]) {
    var arg = require('hash-arg').get([ "string sqlish" ], getopt.argv);
    param = arg.sqlish;
    if(getopt.options["placeholder-values"]) {
        placeholderValues = JSON.parse(getopt.options["placeholder-values"]);
    }
} else {
    let arg = require('hash-arg').get([
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

    // Options
    param = {
        TableName: arg.tableName,
        Key: arg.key
    };
}

try {
    const statement = new DynamoDBDeleteStatement(param);
    awscli.connect();
    statement.dynamodb = awscli.getService("DynamoDB");

    // Dry-run Option
    if(getopt.options["dry-run"]) {
        console.log("// opts for aws.dynamodb.deleteItem:");
        console.log(JSON.stringify(
                statement.getParameter(placeholderValues), null, "    "));
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
            }
        });
    }
} catch (err) {
    console.error("Error:" + err.stack);
    process.exit(1);
}
