#!/bin/env node
var iam = require("../lib/aws-iam");
iam.connect();
iam.attachRolePolicy(
        process.argv[2],
        process.argv[3],
        function(err, data) {
            if(err) {
                console.error("Error:", err);
                return;
            }
            console.log(JSON.stringify(data, null, '    '));
        });


