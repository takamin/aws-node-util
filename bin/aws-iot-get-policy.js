#!/bin/env node
var aws_iot = require('../lib/aws-iot');
var args = require('hash-arg').get([ "policyName" ]);
if(!args.policyName) {
    console.error("ERROR: policyName is required");
    aws_iot.listPolicies(function(err, data) {
        if(!err) {
            console.log(JSON.stringify(data, null, "    "));
        }
        process.exit(1);
    });
} else {
    aws_iot.getPolicy(args.policyName, function(err, data) {
        if(!err) {
            console.log(JSON.stringify(data, null, "    "));
        }
    });
}

