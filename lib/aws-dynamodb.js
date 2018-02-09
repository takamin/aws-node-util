(function() {
    var fs = require('fs');
    var awscli = require("../lib/awscli");
    var DynamoDbScanStatement = require('../lib/dynamodb-scan-statement.js');
    var DynamoDbQueryStatement = require('../lib/dynamodb-query-statement.js');
    var DynamoDbPutItemStatement = require('../lib/dynamodb-put-item-statement.js');
    var DynamoDbDeleteItemStatement = require('../lib/dynamodb-delete-item-statement.js');

    //awscli.setDebug();
    var DynamoDB = null;
    awscli.dynamodb = awscli.dynamodb || {};
    awscli.dynamodb.connect = function(opts) {
        awscli.connect(opts);
        DynamoDB = awscli.getService("DynamoDB");
    };

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

    awscli.dynamodb.ScanStatement = function(sql) {
        var statement = new DynamoDbScanStatement(sql);
        statement.dynamodb = DynamoDB;
        return statement;
    };
    awscli.dynamodb.QueryStatement = function(sql) {
        var statement = new DynamoDbQueryStatement(sql);
        statement.dynamodb = DynamoDB;
        return statement;
    };
    awscli.dynamodb.PutItemStatement = function(sql) {
        var statement = new DynamoDbPutItemStatement(sql);
        statement.dynamodb = DynamoDB;
        return statement;
    };
    awscli.dynamodb.DeleteItemStatement = function(sql) {
        var statement = new DynamoDbDeleteItemStatement(sql);
        statement.dynamodb = DynamoDB;
        return statement;
    };

    var parsers = require("../lib/dynamodb-sqlish-parser");
    awscli.dynamodb.isKeyword = parsers.isKeyword;

    module.exports = awscli.dynamodb;
}());
