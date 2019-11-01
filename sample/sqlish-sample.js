"use strict";
const awsNodeUtil = require("../index");
const ScanStatement = awsNodeUtil.dynamodb.ScanStatement;
const QueryStatement = awsNodeUtil.dynamodb.QueryStatement;
const ResultSet = awsNodeUtil.dynamodb.ResultSet;

// Connect (change each value for your account)
awsNodeUtil.connect(
//    { accessKeyId: 'AKID', secretAccessKey: 'SECRET', region: 'us-west-2' }
);

// Prepare a scanning-all-statement without parameters.
var scanAllStatement = new ScanStatement("FROM stars");

// Prepare 'Scan' statement to filter by name.
// The name is parameterized.
var scanByNameStatement = new ScanStatement(
        "FROM stars WHERE name=:name");

// Prepare 'Query' statement to get children of specific main star.
// The name of a main star is parameterized.
var queryChildrenStatement = new QueryStatement(
        "SELECT mainStar, orbitOrder, name " +
        "FROM stars " +
        "WHERE mainStar=:mainStar");

// Set DynamoDB API interface to each statementa
const dynamodbApi = awsNodeUtil.getService("DynamoDB");
scanAllStatement.dynamodb = dynamodbApi;
scanByNameStatement.dynamodb = dynamodbApi;
queryChildrenStatement.dynamodb = dynamodbApi;

// Run the statements
scanAllStatement.run({}, (err, resp) => {
    console.log("-----------------------");
    console.log("SCAN all items of stars");
    console.log("-----------------------");
    printResult(err, resp);
    scanByNameStatement.run({ ":name": "EARTH" }, (err, resp) => {
        console.log("--------------");
        console.log("SCAN the EARTH");
        console.log("--------------");
        printResult(err, resp);

        queryChildrenStatement.run({ ":mainStar": "EARTH" }, (err, resp) => {
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
