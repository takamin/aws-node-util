#!/usr/bin/node
var apigw = require('../lib/aws-apigateway');
var name = process.argv[2];
apigw.createRestApi(name, function(err, data) {
    console.log(JSON.stringify(data, null, "    "));
});
