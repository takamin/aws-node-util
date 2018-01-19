#!/bin/env node
(function() {
    "use strict";
    var aws = require('../lib/awscli');
    var listit = require('list-it');
    //Use AWS.DynamoDB().listTable({}, function(err,data){...});
    //Then remove "list-tables" key of services table declared in lib/awscli.js
    aws.dynamodb.listTables(function(err, data) {
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
