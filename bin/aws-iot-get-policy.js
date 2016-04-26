#!/usr/bin/node
var awsIoT = require('../lib/aws-iot');
var args = require('hash-arg').get([ "policyName" ]);
if(!args.policyName) {
    console.error("ERROR: policyName is required");
    awsIoT.listPolicies(function(err, data) {
        if(!err) {
            console.log(JSON.stringify(data, null, "    "));
        }
        process.exit(1);
    });
} else {
    awsIoT.getPolicy(args.policyName, function(err, data) {
        if(!err) {
            console.log(JSON.stringify(data, null, "    "));
        }
    });
}

