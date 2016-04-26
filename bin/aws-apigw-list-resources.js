#!/usr/bin/node
var listit = require("list-it");
var apigw = require("../lib/aws-apigateway");
apigw.getRestApis(function(err, restApis) {
    if(err) {
        console.error("Error:", err);
        return;
    }
    restApis.items.forEach(function(restApi) {
        apigw.getResources(restApi.id, function(err, resources) {
            var list = new listit.buffer();
            list.d(
                ["REST-API-ID", "REST-API-NAME", "RESOURCE ID", "RESOURCE PATH"],
                ["-----------", "-------------", "-----------", "-------------"]);
            resources.items.forEach(function(resource) {
                list.d([ restApi.id, restApi.name, resource.id, resource.path]);
            });
            console.log(list.toString());
        });
    });
});

