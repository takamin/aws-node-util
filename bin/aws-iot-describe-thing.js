#!/usr/bin/node
var awsIoT = require('../lib/aws-iot');
var args = require('hash-arg').get([ "thingName" ]);
if(!args.thingName) {
    console.error("ERROR: thingName is required");
    awsIoT.listThings(function(err, data) {
        if(!err) {
            console.log(JSON.stringify(data, null, "    "));
        }
        process.exit(1);
    });
} else {
    awsIoT.describeThing(args.thingName, function(err, data) {
        if(!err) {
            console.log(JSON.stringify(data, null, "    "));
        }
    });
}
