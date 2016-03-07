#!/usr/bin/node
var apigw = require('../lib/aws-apigateway');
if(process.argv.length <= 2) {
    console.error("error: no rest-api-name specified");
    console.error("");
    console.error("usage:");
    console.error("  aws-apigw-create-rest-api <rest-api-name>");
    return 1;
}
var name = process.argv[2];
apigw.createRestApi(name, function(err, data) {
    console.log(JSON.stringify(data, null, "    "));
});
