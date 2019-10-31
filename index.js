var awsNodeUtil = require("./lib/awscli.js");
awsNodeUtil.dynamodb = {
    ResultSet: require("./lib/dynamodb-result-set"),

    // Statements
    DeleteItemStatement: require("./lib/dynamodb-delete-item-statement.js"),
    PutItemStatement: require("./lib/dynamodb-put-item-statement.js"),
    QueryStatement: require("./lib/dynamodb-query-statement.js"),
    ScanStatement: require("./lib/dynamodb-scan-statement.js"),
};
module.exports = awsNodeUtil;
