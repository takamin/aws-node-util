#!/bin/env node
var listit = require("list-it");
var iam = require("../lib/aws-iam");
iam.connect();
iam.listRoles(function(err, data) {
    if(err) {
        console.error("Error:", err);
        return;
    }
    var i = 0;
    var list = new listit.buffer();
    data.Roles.forEach(function(role) {
        list.d([ ++i, role.RoleName, role.CreateDate ]);
    });
    console.log(list.toString());
    console.log("----");
    console.log("Listing IAM roles:", data.Roles.length, "found");
});
