#!/bin/env node
(function() {
    var aws_iot = require('../lib/aws-iot');
    var args = require('hash-arg').get([
        "policyName",
        "policyDocument"
    ]);
    if(!args.policyName) {
        console.error("ERROR: policyName is required");
        process.exit(1);
    }
    var policyDocument = '"' + (args.policyDocument ?
        args.policyDocument : (JSON.stringify({
            "Version":"2012-10-17",
            "Statement":[
                {
                    "Action":["iot:*"],
                    "Resource":["*"],
                    "Effect":"Allow"
                }
            ]
        }).replace(/"/g, '\\"'))) + '"';

    aws_iot.connect();
    aws_iot.createPolicy(
            args.policyName, policyDocument,
            function(err, data) {
                if(!err) {
                    console.log(JSON.stringify(data, null, "    "));
                }
            });
}());
