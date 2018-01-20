#!/bin/env node
(function() {
    "use strict";
    var dynamodb = require('../lib/aws-dynamodb');
    var listit = require('list-it');
    dynamodb.listTables(function(err, data) {
        if(err) {
            console.error("Error:", err);
            process.exit(1);
        }
        var buf = listit.buffer();
        buf.d(["#", "tableName"]);
        var i = 0;
        data.TableNames.forEach(function(tableName) {
            buf.d([++i, tableName]);
        });
        console.log(buf.toString());
    });
}());
