#!/usr/bin/node
var apigw = require("../lib/aws-apigateway");
if(process.argv.length <= 2) {
    console.error("Error: no rest-api-id specified.");
    console.error("usage:");
    console.error("aws-apigw-describe-api <rest-api-id>");
    return 1;
}
var restApiId = process.argv[2];
apigw.getRestApi(restApiId, function(err, restApi) {
    if(err) {
        console.error(err);
        exit(1);
    }
    var output = restApi;
    process.on("exit", function() {
        console.log(JSON.stringify(output, null, "    "));
    });
    apigw.getResources(restApi.id, function(err, resources) {
        if(err) {
            console.error(err);
            exit(1);
        }
        resources.items.forEach(function(resource) {
            if(!("resources" in output)) {
                output.resources = {};
            }
            output.resources[resource.path] = resource;
            if(!("resourceMethods" in resource)) {
                return;
            }
            Object.keys(resource.resourceMethods).forEach(
                function(httpMethod) {
                    apigw.getMethod(
                        restApi.id, resource.id, httpMethod,
                        function(err, method) {
                            if(err) {
                                console.error(err);
                                exit(1);
                            }
                            resource.resourceMethods[httpMethod] = method;
                        });
                });
        });
    });
});
