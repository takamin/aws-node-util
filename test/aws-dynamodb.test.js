"use strict";
const assert = require("chai").assert;
const AwsDynamoDB = require("../lib/aws-dynamodb.js");
describe("AwsDynamoDB", () => {
    describe("convertJsonTableDescToCreate", () => {
        it("should delete LastIncreaseDateTime and LastDecreaseDateTime in ProvisionedThroughput", () => {
            const desc = {
                Table: {
                    GlobalSecondaryIndexes: [
                        {
                            ProvisionedThroughput: {
                                LastIncreaseDateTime: "will be deleted",
                                LastDecreaseDateTime: "will be deleted" 
                            },
                        },
                        {
                            ProvisionedThroughput: {
                                LastIncreaseDateTime: "will be deleted",
                                LastDecreaseDateTime: "will be deleted" 
                            },
                        },
                    ],
                    ProvisionedThroughput: {
                        LastIncreaseDateTime: "will be deleted",
                        LastDecreaseDateTime: "will be deleted" 
                    },
                },
            };
            AwsDynamoDB.convertJsonTableDescToCreate(desc, (err, data) => {
                assert.deepEqual(data.GlobalSecondaryIndexes[0].ProvisionedThroughput, {});
                assert.deepEqual(data.GlobalSecondaryIndexes[1].ProvisionedThroughput, {});
                assert.deepEqual(data.ProvisionedThroughput, {});
            });
        });
    });
});
