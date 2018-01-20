#!/bin/env node
var apigateway = require("../lib/aws-apigateway");

apigw.connect();
apigateway.getRestApis(function(err, data) {
    if(err) {
        return;
    }
    console.log(JSON.stringify(data, null, '  '));
    data.items.forEach(function (api) {
        apigateway.getResources(api.id, function(err, data) {
            if(err) {
                return;
            }
            console.log(JSON.stringify(data, null, '  '));
            data.items.forEach(function (resource) {
                if(!resource.resourceMethods) {
                    return;
                }
                Object.keys(resource.resourceMethods).forEach(function(httpMethod) {
                    apigateway.getMethod(
                        api.id, resource.id, httpMethod,
                        function(err, data) {
                            if(err) {
                                return;
                            }
                            console.log(JSON.stringify(data, null, '  '));
                        }
                    );
                });
            });
        });
    });
});
