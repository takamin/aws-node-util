#!/usr/bin/node
var cli = require("cli");
var apigw = require("aws-apigateway");
apigw.getRestApis(function(err, restApis) {
    if(err) {
        console.error("Error:", err);
        return;
    }
    restApis.items.forEach(function(restApi) {
        apigw.getResources(restApi.id, function(err, resources) {

            var list = new cli.List();
            list.newLine();
            list.addCol("REST-API-ID");
            list.addCol("REST-API-NAME");
            list.addCol("RESOURCE ID");
            list.addCol("RESOURCE PATH");
            list.newLine();
            list.addCol("-----------");
            list.addCol("-------------");
            list.addCol("-----------");
            list.addCol("-------------");
            resources.items.forEach(function(resource) {
                list.newLine();
                list.addCol(restApi.id);
                list.addCol(restApi.name);
                list.addCol(resource.id);
                list.addCol(resource.path);
            });
            console.log(list.toString());
            console.log("----");
        });
    });
});

