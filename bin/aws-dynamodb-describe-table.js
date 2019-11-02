#!/bin/env node
"use strict";
const aws = require("../index.js");
const { isKeyword } = aws.dynamodb;
const listit = require('list-it');
const GetOpt = require('node-getopt');
const HashArg = require('hash-arg');

const getopt = GetOpt.create([
    ['j', 'output-json',            'output a json to read'],
    ['J', 'output-json-oneline',    'output a json in oneline'],
    ['h', 'help',                   'display this help']
    ]).bindHelp().parseSystem();

const arg = HashArg.get([ "tableName" ], getopt.argv);
if(arg.tableName == null) {
    console.error("Error: tableName required");
    process.exit(1);
}

try {
    aws.connect();
    const dynamodb = aws.getService("DynamoDB");
    dynamodb.describeTable({ TableName: arg.tableName }, (err, data) => {
        if(err) {
            console.error("Error:", err);
            process.exit(1);
        }
        if(getopt.options['output-json']) {
            console.log(JSON.stringify(data, null, "    "));
        } else if(getopt.options['output-json-oneline']) {
            console.log(JSON.stringify(data));
        } else {
            const table = data.Table;
            console.log("");
            console.log("Table");
            console.log("");
            const buf = listit.buffer();
            buf.d(["Property", "Value"]);
            buf.d(["TableName", table.TableName]);
            buf.d(["TableArn", table.TableArn]);
            buf.d(["ItemCount", table.ItemCount]);
            buf.d(["TableStatus", table.TableStatus]);
            buf.d(["TableSizeBytes", table.TableSizeBytes]);
            console.log(buf.toString());
            console.log("");
            console.log("AttributeDefinitions");
            console.log("");
            const listItBuf = listit.buffer();
            listItBuf.d(["AttributeName", "AttributeType", "KeyType", "IsKeyword"]);
            table.AttributeDefinitions.forEach(function(attr) {
                let keyType = "-";
                for(let i = 0; i < table.KeySchema.length; i++) {
                    const keydef = table.KeySchema[i];
                    if(attr.AttributeName === keydef.AttributeName) {
                        keyType = keydef.KeyType;
                        break;
                    }
                }
                listItBuf.d([attr.AttributeName, attr.AttributeType, keyType,
                    isKeyword(attr.AttributeName) ? "Keyword" : "-"]);
            })
            console.log(listItBuf.toString());
        }
    });
} catch(err) {
    console.error("Error:", err);
    process.exit(1);
}

