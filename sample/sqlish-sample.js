"use strict";
const awsNodeUtil = require("aws-node-util");
const ScanStatement = awsNodeUtil.dynamodb.ScanStatement;
const QueryStatement = awsNodeUtil.dynamodb.QueryStatement;
const ResultSet = awsNodeUtil.dynamodb.ResultSet;

// Connect (change each value for your account)
awsNodeUtil.dynamodb.connect(
    { accessKeyId: 'AKID', secretAccessKey: 'SECRET', region: 'us-west-2' }
);

// Handler to print result of scan / query
function printResult(err, result) {
    if(err) {
        console.error("Error:", err.stack);
    } else {
        ResultSet.printScanResult(result);
    }
}

// Prepare 'Scan' statement
var scanStatement = new ScanStatement(
        "SELECT mainStar, orbitOrder, name " +
        "FROM stars " +
        "WHERE mainStar=:mainStar");

// Prepare 'Query' statement
var queryStatement = new ScanStatement(
        "SELECT mainStar, orbitOrder, name " +
        "FROM stars " +
        "WHERE mainStar=:mainStar");

// Run the statements
scanStatement.run({ ":mainStar": "SUN" }, printResult);
scanStatement.run({ ":mainStar": "EARTH" }, printResult);
queryStatement.run({ ":mainStar": "SUN" }, printResult);
queryStatement.run({ ":mainStar": "EARTH" }, printResult);

