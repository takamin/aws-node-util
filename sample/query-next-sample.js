"use strict";
const awsNodeUtil = require("../index");
const QueryStatement = awsNodeUtil.dynamodb.QueryStatement;
const ResultSet = awsNodeUtil.dynamodb.ResultSet;

// Connect (change each value for your account)
awsNodeUtil.connect(
//    { accessKeyId: 'AKID', secretAccessKey: 'SECRET', region: 'us-west-2' }
);

// Prepare 'Query' statement
var queryStatement = new QueryStatement(
        "FROM stars WHERE mainStar=:ms LIMIT 2");
queryStatement.dynamodb = awsNodeUtil.getService("DynamoDB");

queryStatement.run({":ms": "SUN" }, (err, data) => {
    if(err) {
        console.error("Error: ", err.message);
    } else if(data) {
        ResultSet.printScanResult(data);
        queryStatement.next();
    } else if(data == null) {
        console.error("OK");
    }
});