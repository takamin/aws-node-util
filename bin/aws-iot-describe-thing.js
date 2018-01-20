#!/bin/env node
(function() {
    "use strict";
    var aws_iot = require('../lib/aws-iot');
    var args = require('hash-arg').get([ "thingName" ]);
    if(!args.thingName) {
        console.error("ERROR: thingName is required");
        aws_iot.listThings(function(err, data) {
            if(!err) {
                console.log(JSON.stringify(data, null, "    "));
            }
            process.exit(1);
        });
    } else {
        aws_iot.describeThing(args.thingName, function(err, data) {
            if(!err) {
                console.log(JSON.stringify(data, null, "    "));
            }
        });
    }
}());
