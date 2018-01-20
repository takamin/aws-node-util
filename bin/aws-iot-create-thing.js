#!/bin/env node
(function() {
    var aws_iot = require('../lib/aws-iot');
    var args = require('hash-arg').get([
        "thingName",
        "attributePayload"
    ]);
    if(!args.thingName) {
        console.error("ERROR: thingName is required");
        process.exit(1);
    } else {
        aws_iot.createThing(
                args.thingName, args.attributePayload,
                function(err, data) {
                    if(!err) {
                        console.log(JSON.stringify(data, null, "    "));
                    }
                });
    }
}());
