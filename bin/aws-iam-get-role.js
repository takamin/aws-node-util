#!/usr/bin/node
var iam = require("../lib/aws-iam");
iam.getRole(process.argv[2], function(err, data) {
    if(err) {
        console.error("Error:", err);
        return;
    }
    console.log(JSON.stringify(data, null, '    '));
});

