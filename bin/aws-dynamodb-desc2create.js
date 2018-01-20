#!/bin/env node
var dynamodb = require("../lib/aws-dynamodb");
if(process.argv.length <= 2) {
    console.log("ERROR: no table name specified");
    return 1;
}
var tableName = process.argv[2];
dynamodb.describeTable(tableName, function(err, desc) {
    dynamodb.convertJsonTableDescToCreate(desc, function(err, data) {
        console.log(JSON.stringify(data, null, "    "));
    });
});
