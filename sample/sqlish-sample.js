"use strict";
const awsNodeUtil = require("../index");
const ScanStatement = awsNodeUtil.dynamodb.ScanStatement;
const QueryStatement = awsNodeUtil.dynamodb.QueryStatement;
const ResultSet = awsNodeUtil.dynamodb.ResultSet;

// Connect (change each value for your account)
awsNodeUtil.dynamodb.connect(
//    { accessKeyId: 'AKID', secretAccessKey: 'SECRET', region: 'us-west-2' }
);

// Prepare 'Scan' statement
var scanStatement = ScanStatement(
        "FROM stars WHERE name=:name");

// Prepare 'Query' statement
var queryStatement = QueryStatement(
        "SELECT mainStar, orbitOrder, name " +
        "FROM stars " +
        "WHERE mainStar=:mainStar");

// Run the statements
ScanStatement("FROM stars").run({}, (err, resp) => {
    console.log("-----------------------");
    console.log("SCAN all items of stars");
    console.log("-----------------------");
    printResult(err, resp);
    scanStatement.run({ ":name": "EARTH" }, (err, resp) => {
        console.log("--------------");
        console.log("SCAN the EARTH");
        console.log("--------------");
        printResult(err, resp);

        queryStatement.run({ ":mainStar": "EARTH" }, (err, resp) => {
            console.log("------------------------------");
            console.log("QUERY child stars of the EARTH");
            console.log("------------------------------");
            printResult(err, resp);
        });
    });
});

// Handler to print result of scan / query
function printResult(err, result) {
    if(err) {
        console.error("Error:", err.stack);
    } else {
        ResultSet.printScanResult(result);
    }
}
