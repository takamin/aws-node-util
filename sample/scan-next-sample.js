"use strict";
const awsNodeUtil = require("../index");
const ScanStatement = awsNodeUtil.dynamodb.ScanStatement;
const ResultSet = awsNodeUtil.dynamodb.ResultSet;

// Connect (change each value for your account)
awsNodeUtil.dynamodb.connect(
//    { accessKeyId: 'AKID', secretAccessKey: 'SECRET', region: 'us-west-2' }
);

// Prepare 'Scan' statement
var scanStatement = ScanStatement(
        "FROM stars LIMIT 3");
scanStatement.run({}, (err, data) => {
    if(err) {
        console.error("Error: ", err.message);
    } else if(data) {
        ResultSet.printScanResult(data);
        scanStatement.next();
    } else if(data == null) {
        console.error("OK");
    }
});
