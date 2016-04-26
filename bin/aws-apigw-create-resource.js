#!/usr/bin/node
var apigw = require('../lib/aws-apigateway');
var pathPart = process.argv[2];
var parentId = process.argv[3];
var restApiId = process.argv[4];
apigw.createResource(pathPart, parentId, restApiId, function(err, data) {
    console.log(JSON.stringify(data, null, "    "));
});
