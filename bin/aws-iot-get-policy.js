#!/usr/bin/node
var aws = require('../lib/awscli');
var args = require('hash-arg').get([ "policyName" ]);
if(!args.policyName) {
    console.error("ERROR: policyName is required");
    aws.iot.listPolicies(function(err, data) {
        if(!err) {
            console.log(JSON.stringify(data, null, "    "));
        }
        process.exit(1);
    });
} else {
    aws.iot.getPolicy(args.policyName, function(err, data) {
        if(!err) {
            console.log(JSON.stringify(data, null, "    "));
        }
    });
}

