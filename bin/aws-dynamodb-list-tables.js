#!/bin/env node
"use strict";
const awscli = require("../lib/awscli.js");
const listit = require("list-it");

try {
    awscli.connect();
    const dynamodb = awscli.getService("DynamoDB");

    dynamodb.listTables({}, (err, data) => {
        if(err) {
            console.error("Error:", err);
            process.exit(1);
        }
        const listItBuf = listit.buffer();
        listItBuf.d(["#", "tableName"]);
        let i = 0;
        data.TableNames.forEach(function(tableName) {
            listItBuf.d([++i, tableName]);
        });
        console.log(listItBuf.toString());
    });
} catch(err) {
    console.error("Error:", err);
    process.exit(1);
}
