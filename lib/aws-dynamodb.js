var fs = require('fs');
awsDynamoDB = {};
awsDynamoDB.putCreateTableJson = function(filename) {
    fs.readFile(filename, function(err, data) {
        var desc = JSON.parse(data);
        var create = desc.Table;
        for(var i = 0; i < create.GlobalSecondaryIndexes.length; i++) {
            delete create.GlobalSecondaryIndexes[i].IndexSizeBytes;
            delete create.GlobalSecondaryIndexes[i].ProvisionedThroughput.NumberOfDecreasesToday;
            delete create.GlobalSecondaryIndexes[i].IndexStatus;
            delete create.GlobalSecondaryIndexes[i].IndexArn;
            delete create.GlobalSecondaryIndexes[i].ItemCount;
        }
        delete create.TableArn; 
        delete create.ProvisionedThroughput.NumberOfDecreasesToday; 
        delete create.TableSizeBytes;
        delete create.TableStatus;
        delete create.LatestStreamLabel;
        delete create.ItemCount;
        delete create.CreationDateTime;
        delete create.LatestStreamArn;
        console.log(JSON.stringify(create, null, "    "));
    });
};
module.exports = awsDynamoDB;
