#!/usr/bin/node
(function() {
    var aws = require('../lib/awscli');
    var args = require('hash-arg').get([
        "policyName",
        "policyDocument"
    ]);
    if(!args.policyName) {
        console.error("ERROR: policyName is required");
        process.exit(1);
    }
    var policyDocument = JSON.stringify(
            {}
            );
    aws.iot.createPolicy(
            args.policyName, args.policyDocument,
            function(err, data) {
                if(!err) {
                    console.log(JSON.stringify(data, null, "    "));
                }
            });
}());
