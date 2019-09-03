var fs = require('fs');
var awscli = require("../lib/awscli");
var DynamoDbScanStatement = require('../lib/dynamodb-scan-statement.js');
var DynamoDbQueryStatement = require('../lib/dynamodb-query-statement.js');
var DynamoDbPutItemStatement = require('../lib/dynamodb-put-item-statement.js');
var DynamoDbDeleteItemStatement = require('../lib/dynamodb-delete-item-statement.js');

/**
 * AwsDynamoDB class.
 * @constructor
 */
function AwsDynamoDB() { }

var DynamoDB = null;

/**
 * Connect to the AWS.
 * This connection will be set to the statement instances which
 * this module will provides.
 *
 * @param {object} opts
 * The object specifying destination to connect such as
 * `{ accessKeyId: 'AKID', secretAccessKey: 'SECRET', region: 'us-west-2' }`.
 * If this is omitted, the keys in local environment stored
 * at '~/.aws/' is used.
 *
 * @returns {undefined}
 */
AwsDynamoDB.connect = function(opts) {
    awscli.connect(opts);
    DynamoDB = awscli.getService("DynamoDB");
};

/**
 * DynamoDB.listTables
 *
 * @param {Function} callback Callback function
 * @returns {undefined}
 */
AwsDynamoDB.listTables = function(callback) {
    DynamoDB.listTables({ }, callback);
};

/**
 * Describe a table definition
 * @param {string} tableName Tabale name described
 * @param {Function} callback callback to receive result.
 * @returns {undefined}
 */
AwsDynamoDB.describeTable = function(tableName, callback) {
    DynamoDB.describeTable({ TableName: tableName }, callback);
};

AwsDynamoDB.putCreateTableJson = function(filename) {
    fs.readFile(filename, function(err, data) {
        if(err) {
            console.error("ERROR:", err);
            return;
        }
        var desc = JSON.parse(data);
        AwsDynamoDB.convertJsonTableDescToCreate(desc, function(err, data){
            if(err) {
                console.error("ERROR:", err);
                return;
            }
            console.log(JSON.stringify(data, null, "    "));
        });
    });
};

AwsDynamoDB.convertJsonTableDescToCreate = function(desc, callback) {
    var create = desc.Table;
    if(create.GlobalSecondaryIndexes) {
        for(var i = 0; i < create.GlobalSecondaryIndexes.length; i++) {
            delete create.GlobalSecondaryIndexes[i].IndexSizeBytes;
            delete create.GlobalSecondaryIndexes[i].ProvisionedThroughput.NumberOfDecreasesToday;
            delete create.GlobalSecondaryIndexes[i].ProvisionedThroughput.LastIncreaseDateTime;
            delete create.GlobalSecondaryIndexes[i].ProvisionedThroughput.LastDecreaseDateTime;
            delete create.GlobalSecondaryIndexes[i].IndexStatus;
            delete create.GlobalSecondaryIndexes[i].IndexArn;
            delete create.GlobalSecondaryIndexes[i].ItemCount;
        }
    }
    delete create.TableArn;
    delete create.ProvisionedThroughput.NumberOfDecreasesToday;
    delete create.ProvisionedThroughput.LastIncreaseDateTime;
    delete create.ProvisionedThroughput.LastDecreaseDateTime;
    delete create.TableSizeBytes;
    delete create.TableStatus;
    delete create.LatestStreamLabel;
    delete create.ItemCount;
    delete create.CreationDateTime;
    delete create.LatestStreamArn;
    callback(null, create);
};

/**
 * create DynamoDbScanStatement.
 *
 * SQL-ish Syntax:
 *
 * ```
 * [SELECT <projection-expression>]
 * FROM <table-name>
 * [WHERE <filter-expression>]
 * [LIMIT <limit>]
 * ```
 *
 * * `[]` is representing that can be ommited.
 * * `<projection-expression>` - The comma separated attribute names to select.
 * * `<table-name>` - DynamoDB table name.
 * * `<filter-expression>` - Filtering conditional expression.
 * * `<limit>` - The number of items to scan.
 *
 * @param {string} sql SQL-ish statement
 *
 * @returns {DynamoDbScanStatement} SQL-ish Scan statement object
 */
AwsDynamoDB.ScanStatement = function(sql) {
    var statement = new DynamoDbScanStatement(sql);
    statement.dynamodb = DynamoDB;
    return statement;
};

/**
 * create DynamoDbQueryStatement.
 *
 * SQL-ish Syntax:
 *
 * ```
 * [SELECT <projection-expression>]
 * FROM <table-name>
 * WHERE <key-condition-expression>
 * [FILTER <filter-expression>]
 * [LIMIT <limit>]
 * ```
 *
 * * `[]` is representing that can be ommited.
 * * `<projection-expression>` - The comma separated attribute names to select.
 * * `<table-name>` - DynamoDB table name.
 * * `<key-condition-expression>` - Primary key conditional expression.
 * * `<filter-expression>` - Filtering conditional expression.
 * * `<limit>` - The number of items to scan.
 *
 * @param {string} sql SQL-ish statement
 *
 * @returns {DynamoDbQueryStatement} SQL-ish Query statement object
 */
AwsDynamoDB.QueryStatement = function(sql) {
    var statement = new DynamoDbQueryStatement(sql);
    statement.dynamodb = DynamoDB;
    return statement;
};

/**
 * create DynamoDbPutItemStatement.
 *
 * SQL-ish Syntax:
 *
 * ```
 * INSERT INTO <table-name> ( <attribute-list> )
 * VALUES ( <value-list> )
 * [WHERE <key-condition-expression>]
 * ```
 *
 * * `[]` is representing that can be ommited.
 * * `<table-name>` - DynamoDB table name.
 * * `<attribute-list>` - The comma separated attribute names.
 * * `<values-list>` - The comma separated attribute values.
 * * `<key-condition-expression>` - Primary key conditional expression.
 *
 * @param {string} sql SQL-ish statement
 *
 * @returns {DynamoDbPutItemStatement} SQL-ish PutItem statement object
 */
AwsDynamoDB.PutItemStatement = function(sql) {
    var statement = new DynamoDbPutItemStatement(sql);
    statement.dynamodb = DynamoDB;
    return statement;
};

/**
 * create DynamoDbDeleteItemStatement.
 *
 * SQL-ish Syntax:
 *
 * ```
 * DELETE FROM <table-name>
 * [WHERE <key-condition-expression>]
 * ```
 *
 * * `[]` is representing that can be ommited.
 * * `<table-name>` - DynamoDB table name.
 * * `<key-condition-expression>` - Primary key conditional expression.
 *
 * @param {string} sql SQL-ish statement
 *
 * @returns {DynamoDbDeleteItemStatement} SQL-ish DeleteItem statement object
 */
AwsDynamoDB.DeleteItemStatement = function(sql) {
    var statement = new DynamoDbDeleteItemStatement(sql);
    statement.dynamodb = DynamoDB;
    return statement;
};

var parsers = require("../lib/dynamodb-sqlish-parser");
AwsDynamoDB.isKeyword = parsers.isKeyword;

module.exports = AwsDynamoDB;
