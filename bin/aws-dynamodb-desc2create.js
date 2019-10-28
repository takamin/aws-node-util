#!/bin/env node
const awscli = require("../lib/awscli.js");

/**
 * Convert a table description object to a parameter for the createTable API.
 * @param {object} desc A table description
 * @returns {object} a parameter for the createTable API
 */
function convertDescToCreateParam(desc) {
    const create = desc.Table;
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
    delete create.TableId;
    return create;
}

if(process.argv.length <= 2) {
    console.log("ERROR: no table name specified");
    process.exit(1);
}
const tableName = process.argv[2];

try {
    awscli.connect();
    const dynamodb = awscli.getService("DynamoDB");

    dynamodb.describeTable({ TableName: tableName }, (err, desc) => {
        if(err) {
            console.error("Error:", err);
            process.exit(1);
        }
        const param = convertDescToCreateParam(desc);
        console.log(JSON.stringify(param, null, 4));
    });
} catch(err) {
    console.error(err.message);
    process.exit(1);
}