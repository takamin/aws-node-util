#!/bin/env node
var aws_iot = require('../lib/aws-iot');
var args = require('hash-arg').get([ "thingName" ]);

aws_iot.connect();
if(!args.thingName) {
    console.error("ERROR: thingName is required");
    aws_iot.listThings(function(err, data) {
        if(!err) {
            console.log(JSON.stringify(data, null, "    "));
        }
        process.exit(1);
    });
} else {
    aws_iot.deleteThing(args.thingName, function(err, data) {
        if(!err) {
            console.log(JSON.stringify(data, null, "    "));
        }
    });
}
