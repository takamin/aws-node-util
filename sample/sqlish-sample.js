"use strict";
const awsNodeUtil = require("../index");
const ScanStatement = awsNodeUtil.dynamodb.ScanStatement;
const QueryStatement = awsNodeUtil.dynamodb.QueryStatement;
const PutItemStatement = awsNodeUtil.dynamodb.PutItemStatement;
const DeleteItemStatement = awsNodeUtil.dynamodb.DeleteItemStatement;
const ResultSet = awsNodeUtil.dynamodb.ResultSet;

// Connect (change each value for your account)
awsNodeUtil.dynamodb.connect(
//    { accessKeyId: 'AKID', secretAccessKey: 'SECRET', region: 'us-west-2' }
);

// Handler to print result of scan / query
function printResult(err, result) {
    if(err) {
        console.error("Error:", err.stack);
    } else {
        ResultSet.printScanResult(result);
    }
}

// Prepare 'PutItem' statement
var putItemStatement = PutItemStatement(
    ["INSERT INTO stars (",
        "mainStar, role, orbitOrder, name",
    ") VALUES (",
        "'SUN', 'planet', 10, 'X'",
    ")"].join(" "));

// Prepare 'Scan' statement
var scanStatement = ScanStatement(
        "FROM stars WHERE name=:name");

// Prepare 'Query' statement
var queryStatement = QueryStatement(
        "SELECT mainStar, orbitOrder, name " +
        "FROM stars " +
        "WHERE mainStar=:mainStar");

// Prepare 'DeleteItem' statement
var deleteItemStatement = DeleteItemStatement([
        "DELETE FROM stars",
        "WHERE mainStar = 'SUN' AND",
            "orbitOrder = 10",
        ].join(" "));

// Run the statements
putItemStatement.run({}, (err, resp) => {
    if(err) {
        console.error(err.stack);
        return;
    }
    scanStatement.run({ ":name": "X" }, (err, resp) => {
        console.log("-------------------");
        console.log("SCAN stars named X");
        console.log("-------------------");
        printResult(err, resp);

        queryStatement.run({
            ":mainStar": "SUN"
        }, (err, resp) => {
            console.log("----------------------------");
            console.log("QUERY child stars of the SUN");
            console.log("----------------------------");
            printResult(err, resp);

            queryStatement.run({
                ":mainStar": "EARTH"
            }, (err, resp) => {
                console.log("------------------------------");
                console.log("QUERY child stars of the EARTH");
                console.log("------------------------------");
                printResult(err, resp);

                deleteItemStatement.run({
                    ":mainStar": "SUN",
                    ":orbitOrder": 10
                }, (err, resp) => {
                    if(err) {
                        console.error(err.stack);
                        return;
                    }
                    scanStatement.run({
                        ":name": "X"
                    }, (err, resp) => {
                        console.log("-------------------");
                        console.log("SCAN stars named X");
                        console.log("-------------------");
                        printResult(err, resp);
                    });
                });
            });
        });
    });
});

