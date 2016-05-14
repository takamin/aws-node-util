#!/usr/bin/node
(function() {
    "use strict";
    var aws = require('../lib/awscli');
    var args = require('hash-arg').get([ "thingName" ]);
    if(!args.thingName) {
        console.error("ERROR: thingName is required");
        aws.iot.listThings(function(err, data) {
            if(!err) {
                console.log(JSON.stringify(data, null, "    "));
            }
            process.exit(1);
        });
    } else {
        aws.iot.describeThing(args.thingName, function(err, data) {
            if(!err) {
                console.log(JSON.stringify(data, null, "    "));
            }
        });
    }
}());
