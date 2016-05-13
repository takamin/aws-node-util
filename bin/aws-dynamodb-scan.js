#!/usr/bin/node
(function() {
    "use strict";
    var dynamodb = require('../lib/aws-dynamodb');
    var listit = require('list-it');
    var getopt = require('node-getopt').create([
        ['c', 'max-items=ARG',          'The total number of items to return'],
        ['n', 'starting-token=ARG',     'A token to specify where to start paginating'],
        ['s', 'sort-item=ARG',     'JSON path to the sort item'],
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
    dynamodb.scan(arg.tableName, maxItems, startingToken, function(err, data) {
        if(err) {
            console.error("Error:", err);
            process.exit(1);
        }
        if(getopt.options['output-json']) {
            console.log(JSON.stringify(data, null, "    "));
        } else if(getopt.options['output-json-oneline']) {
            console.log(JSON.stringify(data));
        } else {
            var colNames = [];
            var scanColumns = function(item, namePath) {
                namePath = namePath || [];
                Object.keys(item).forEach(function(key) {
                    namePath.push(key);
                    var attrName = namePath.join('.');
                    var type = null;
                    var types = Object.keys(item[key]);
                    if(types.length > 0) {
                        type = types[0];
                    }
                    if(type == 'M') {
                        scanColumns(item[key]['M'], namePath);
                    } else {
                        if(colNames.indexOf(attrName) < 0) {
                            colNames.push(attrName);
                        }
                    }
                    namePath.pop();
                });
            };
            var refItemValue = function(obj, path) {
                var dataitem = obj;
                var pathes = path.split('.');
                pathes.forEach(function(path) {
                    dataitem = dataitem[path];
                    var types = Object.keys(dataitem);
                    if(types.length > 0) {
                        dataitem = dataitem[types[0]];
                    }
                });
                return dataitem;
            }
            
            // Traverse column names
            data.Items.forEach(function(item) {
                scanColumns(item);
            });

            // Put data to bidim array
            var rows = [];
            data.Items.forEach(function(item) {
                var cols = [];
                colNames.forEach(function(pathItem) {
                    var value = refItemValue(item, pathItem);
                    if(value == null) {
                        value = "";
                    }
                    cols.push(value);
                });
                rows.push(cols);
            });

            var buf = listit.buffer();
            var rownum = 0;
            buf.d("ROWNUM");
            buf.d(colNames);
            rows.forEach(function(row) {
                buf.d(++rownum);
                buf.d(row);
            });
            console.log(buf.toString());
        }
        if("NextToken" in data) {
            console.log("NextToken:", data.NextToken);
        }
    });
}());

