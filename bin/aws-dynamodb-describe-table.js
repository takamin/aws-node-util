#!/bin/env node
(function() {
    "use strict";
    var awscli = require('../lib/awscli');
    var dynamodb = require('../lib/aws-dynamodb');
    var listit = require('list-it');
    var getopt = require('node-getopt').create([
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
    dynamodb.describeTable(arg.tableName, function(err, data) {
        if(err) {
            console.error("Error:", err);
            process.exit(1);
        }
        if(getopt.options['output-json']) {
            console.log(JSON.stringify(data, null, "    "));
        } else if(getopt.options['output-json-oneline']) {
            console.log(JSON.stringify(data));
        } else {
            var table = data.Table;
            console.log("");
            console.log("Table");
            console.log("");
            var buf = listit.buffer();
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
            buf = listit.buffer();
            buf.d(["AttributeName", "AttributeType", "KeyType", "IsKeyword"]);
            table.AttributeDefinitions.forEach(function(attr) {
                var keyType = "-";
                for(var i = 0; i< table.KeySchema.length; i++) {
                    var keydef = table.KeySchema[i];
                    if(attr.AttributeName === keydef.AttributeName) {
                        keyType = keydef.KeyType;
                        break;
                    }
                }
                buf.d([attr.AttributeName, attr.AttributeType, keyType,
                    dynamodb.isKeyword(attr.AttributeName) ? "Keyword" : "-"]);
            })
            console.log(buf.toString());
        }
    });
}());

