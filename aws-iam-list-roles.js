#!/usr/bin/node
var cli = require("cli");
var iam = require("aws-iam");
iam.listRoles(function(err, data) {
    if(err) {
        console.error("Error:", err);
        return;
    }
    var i = 0;
    var list = new cli.List();
    data.Roles.forEach(function(role) {
        list.newLine();
        list.addCol("" + ++i + ".");
        list.addCol(role.RoleName);
        list.addCol(role.CreateDate);
    });
    console.log(list.toString());
    console.log("----");
    console.log("Listing IAM roles:", data.Roles.length, "found");
});
