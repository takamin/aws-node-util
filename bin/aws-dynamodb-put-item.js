#!/bin/env node
"use strict";
const aws = require("../index.js");
const { PutItemStatement } = aws.dynamodb;

var getopt = require('node-getopt').create([
    ['j', 'output-json',            'output a json to read'],
    ['J', 'output-json-oneline',    'output a json in oneline'],
    ['t', 'dry-run',                'Print options of the putItem and exit'],
    ['q', 'sql-ish',                'Query by SQL-ish-statement(beta)'],
    ['p', 'placeholder-values=JSON','Placeholder values. specify as JSON'],
    ['h', 'help',                   'display this help']
    ]).bindHelp().parseSystem();
var param = [];
var placeholderValues = {};
if(getopt.options["sql-ish"]) {
    let arg = require('hash-arg').get([ "string sqlish" ], getopt.argv);
    param.push(arg.sqlish);
    if(getopt.options["placeholder-values"]) {
        placeholderValues = JSON.parse(getopt.options["placeholder-values"]);
    }
} else {
    let arg = require('hash-arg').get([
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
        let params = {};
        params["TableName"] = arg.tableName;
        params["Item"] = item;
        param.push(params);
    });
}
param.forEach((params) => {
    try {
        const statement = new PutItemStatement(params);
        aws.connect();
        statement.dynamodb = aws.getService("DynamoDB");

        // Dry-run Option
        if(getopt.options["dry-run"]) {
            console.log("// opts for aws.dynamodb.putItem:");
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
        console.error(
                "Error:" + err.stack);
        process.exit(1);
    }
});
