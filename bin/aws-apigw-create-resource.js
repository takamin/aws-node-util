#!/bin/env node
var apigw = require('../lib/aws-apigateway');
if(process.argv.length <= 4) {
    console.error("error: invalid parameters");
    console.error("");
    console.error("usage:");
    console.error("  aws-apigw-create-resource <resource-name> <parent-resouce-id> <rest-api-id>");
    console.error("");
    console.error("To confirm available parent-resouce-id or rest-api-id, you can use 'aws-apigw-list-resources'.");
    return 1;
}
var pathPart = process.argv[2];
var parentId = process.argv[3];
var restApiId = process.argv[4];
apigw.createResource(pathPart, parentId, restApiId, function(err, data) {
    console.log(JSON.stringify(data, null, "    "));
});
