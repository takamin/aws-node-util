#!/usr/bin/node
var iam = require("../lib/aws-iam");
var fs = require("fs");
fs.readFile(process.argv[3], function(err, data) {
    if(err) {
        console.error("Error:", err);
        return;
    }
    var pdoc = JSON.parse(data);
    iam.createRole(process.argv[2],
        JSON.stringify(pdoc),
        function(err, data)
    {
        if(err) {
            console.error("Error:", err);
            return;
        }
        console.log(JSON.stringify(data, null, '    '));
    });
});

