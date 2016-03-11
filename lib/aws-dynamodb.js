var fs = require('fs');
var awscli = require("awscli");
awscli.dynamodb = {};
awscli.dynamodb.exec = function(command, opts, callback){
    awscli.exec('dynamodb', command, opts, callback);
};
awscli.dynamodb.describeTable = function(tableName, callback) {
    awscli.dynamodb.exec("describe-table", {
        "--table-name": tableName
    }, callback);
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
module.exports = awscli.dynamodb;
