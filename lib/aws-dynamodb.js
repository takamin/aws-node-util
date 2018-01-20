(function() {
    var fs = require('fs');
    var awscli = require("../lib/awscli");
    //awscli.setDebug();
    var DynamoDB = awscli.getService("DynamoDB");
    awscli.dynamodb = awscli.dynamodb || {};

    /**
     * DynamoDB.listTables
     *
     * @param {Function} callback Callback function
     * @returns {undefined}
     */
    awscli.dynamodb.listTables = function(callback) {
        DynamoDB.listTables({ }, callback);
    };

    /**
     * Describe a table definition
     * @param {string} tableName Tabale name described
     * @param {Function} callback callback to receive result.
     * @returns {undefined}
     */
    awscli.dynamodb.describeTable = function(tableName, callback) {
        DynamoDB.describeTable({ TableName: tableName }, callback);
    };

    awscli.dynamodb.putCreateTableJson = function(filename) {
        fs.readFile(filename, function(err, data) {
            if(err) {
                console.error("ERROR:", err);
                return;
            }
            var desc = JSON.parse(data);
            awscli.dynamodb.convertJsonTableDescToCreate(desc, function(err, data){
                if(err) {
                    console.error("ERROR:", err);
                    return;
                }
                console.log(JSON.stringify(data, null, "    "));
            });
        });
    };

    awscli.dynamodb.convertJsonTableDescToCreate = function(desc, callback) {
        var create = desc.Table;
        if(create.GlobalSecondaryIndexes) {
            for(var i = 0; i < create.GlobalSecondaryIndexes.length; i++) {
                delete create.GlobalSecondaryIndexes[i].IndexSizeBytes;
                delete create.GlobalSecondaryIndexes[i].ProvisionedThroughput.NumberOfDecreasesToday;
                delete create.GlobalSecondaryIndexes[i].IndexStatus;
                delete create.GlobalSecondaryIndexes[i].IndexArn;
                delete create.GlobalSecondaryIndexes[i].ItemCount;
            }
        }
        delete create.TableArn;
        delete create.ProvisionedThroughput.NumberOfDecreasesToday;
        delete create.TableSizeBytes;
        delete create.TableStatus;
        delete create.LatestStreamLabel;
        delete create.ItemCount;
        delete create.CreationDateTime;
        delete create.LatestStreamArn;
        callback(null, create);
    };

    /**
     * Scan dynamodb table
     * @param {DynamodbStatement} statement DynamodbStatement
     * @param {Function} callback callback to receive result set.
     * @returns {undefined}
     */
    awscli.dynamodb.runScanStatemnt = function(statement, callback) {
        var param = statement.getScanParameter();
        DynamoDB.scan(param, callback);
    };

    /**
     * Query dynamodb table
     * @param {DynamodbStatement} statement DynamodbStatement
     * @param {Function} callback callback to receive result set.
     * @returns {undefined}
     */
    awscli.dynamodb.runQueryStatemnt = function(statement, callback) {
        var param = statement.getQueryParameter();
        DynamoDB.query(param, callback);
    };

    var parsers = require("../lib/aws-dynamodb-expr-parsers");
    awscli.dynamodb.isKeyword = parsers.isKeyword;

    module.exports = awscli.dynamodb;
}());
