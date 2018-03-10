"use strict";
const awsNodeUtil = require("../index");
const QueryStatement = awsNodeUtil.dynamodb.QueryStatement;
const PutItemStatement = awsNodeUtil.dynamodb.PutItemStatement;
const DeleteItemStatement = awsNodeUtil.dynamodb.DeleteItemStatement;
const ResultSet = awsNodeUtil.dynamodb.ResultSet;

// Connect (change each value for your account)
awsNodeUtil.dynamodb.connect(
//    { accessKeyId: 'AKID', secretAccessKey: 'SECRET', region: 'us-west-2' }
);
// Handler to print result of scan / query
function printResult(result) {
    ResultSet.printScanResult(result);
}

// Prepare 'PutItem' statement
var putItemStatement = PutItemStatement(
    ["INSERT INTO stars (",
        "mainStar, role, orbitOrder, name",
    ") VALUES (",
        "'SUN', 'planet', 10, 'X'",
    ")"].join(" "));

// Add planet X
putStar(putItemStatement, {}).then( () => {

    // Add planet Y
    putItemStatement.setValues([
        "SUN", "planet", 25, "Y"
    ]);
    return putStar( putItemStatement, {});

}).then( () => {

    // Add planet Z
    return putStar( putItemStatement, {
        orbitOrder:35, name:"Z"
    });// mainStar and role is not changed from previous.

}).then( () => {
    return queryStar("mainStar, orbitOrder, name, role", "mainStar = 'SUN'");
}).then(resp => {
    console.log("----------------------------");
    console.log("QUERY child stars of the SUN");
    console.log("----------------------------");
    printResult(resp);
}).then( () => {

    //Delete planets named X, Y and Z.
    return deleteWhere( "mainStar = 'SUN' AND orbitOrder >= 10" );

}).then( () => {
    return queryStar("mainStar, orbitOrder, name, role", "mainStar = 'SUN'");
}).then(resp => {
    console.log("----------------------------");
    console.log("QUERY child stars of the SUN");
    console.log("----------------------------");
    printResult(resp);
}).catch( err => {
    console.error("Error:", err.stack);
});

function deleteWhere(condition) {
    return queryStar( "mainStar, orbitOrder", condition ).then(result => {
        let resultSet = new ResultSet(result);
        return Promise.all(resultSet.getItems().map(item => {
            return deleteStar([
                "mainStar = '" + item.mainStar + "'",
                "AND orbitOrder = " + item.orbitOrder
            ].join(" "));
        }));
    });
}

function putStar(statement, args) {
    return new Promise( (resolve, reject) => {
        statement.run(args, err => {
            if(err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function queryStar(select, condition) {
    return new Promise( (resolve, reject) => {
        QueryStatement([
            "SELECT", select, "FROM stars",
            "WHERE", condition
        ].join(" ")).run({}, (err, result) => {
            if(err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function deleteStar(condition) {
    return new Promise( (resolve, reject) => {
        console.log("DELETE", condition);
        DeleteItemStatement([
            "DELETE FROM stars WHERE",
            condition
        ].join(" ")).run({}, (err) => {
            if(err) {
                reject(err);
            } else {
                resolve();
            }
        })
    });
}
