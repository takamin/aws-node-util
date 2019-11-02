"use strict";
const aws = require("./lib/awscli.js");

aws.dynamodb = {
    ResultSet: require("./lib/dynamodb-result-set"),

    // Runnable statements
    DeleteItemStatement: require("./lib/runnable-delete-item-statement.js"),
    PutItemStatement: require("./lib/runnable-put-item-statement.js"),
    QueryStatement: require("./lib/runnable-query-statement.js"),
    ScanStatement: require("./lib/runnable-scan-statement.js"),

    parser: {
        DeleteItemStatement: require("./lib/dynamodb-delete-item-statement.js"),
        PutItemStatement: require("./lib/dynamodb-put-item-statement.js"),
        QueryStatement: require("./lib/dynamodb-query-statement.js"),
        ScanStatement: require('./lib/dynamodb-scan-statement.js'),
    },

    isKeyword: require("./lib/dynamodb-keywords.js").isKeyword,
};

module.exports = aws;
