#!/usr/bin/node
(function() {
    var aws = require('../lib/awscli');
    var args = require('hash-arg').get([
        "thingName",
        "attributePayload"
    ]);
    if(!args.thingName) {
        console.error("ERROR: thingName is required");
        process.exit(1);
    } else {
        aws.iot.createThing(
                args.thingName, args.attributePayload,
                function(err, data) {
                    if(!err) {
                        console.log(JSON.stringify(data, null, "    "));
                    }
                });
    }
}());
