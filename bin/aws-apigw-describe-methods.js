#!/bin/env node
var apigw = require('../lib/aws-apigateway');
var restApiId = process.argv[2];
var output = {
    "restApiName": null,
    "restApiId": null,
    "resources":[],
};
process.on("exit", function() {
    console.log(JSON.stringify(output, null, "    "));
});
apigw.getRestApi(restApiId, function(err, restApi) {
    if(err) {
        console.error(err);
        exit(1);
    }
    //console.log(JSON.stringify(restApi, null, "    "));
    output.restApiName = restApi.name;
    output.restApiId = restApi.id;
    apigw.getResources(restApiId, function(err, resources) {
        if(err) {
            console.error(err);
            exit(1);
        }
        //console.log(JSON.stringify(resources, null, "    "));
        resources.items.forEach(function(resource) {
            var resource_out = {
                "resourcePath": resource.path,
                "resourceId": resource.id,
                "httpMethods":{}
            };
            try {
                //console.log(JSON.stringify(resource, null, "    "));
                if(!("resourceMethods" in resource)) {
                    return;
                }
                Object.keys(resource.resourceMethods).forEach(function(httpMethod) {
                    apigw.getMethod(restApi.id, resource.id, httpMethod, function(err, method) {
                        if(err) {
                            console.error(err);
                            exit(1);
                        }
                        resource_out.httpMethods[httpMethod] = method;
                        //console.log(JSON.stringify(method, null, "    "));
                    });
                });
            } catch(err) {
                console.error(err);
            }
            output.resources.push(resource_out);
        });
    });
});

