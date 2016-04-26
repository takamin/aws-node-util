var awscli = require("./awscli");
awscli.apigateway = {};
awscli.apigateway.exec = function(command, opts, callback){
    awscli.exec('apigateway', command, opts, callback);
};
awscli.apigateway.createRestApi = function(name, callback) {
    awscli.apigateway.exec(
            'create-rest-apis', {
                "--name": name
            }, callback);
};
awscli.apigateway.getRestApis = function(callback) {
    awscli.apigateway.exec(
            'get-rest-apis', null, callback);
};
awscli.apigateway.getRestApi = function(restApiId, callback) {
    awscli.apigateway.exec(
            'get-rest-api', {
                "--rest-api-id": restApiId
            }, callback);
};
awscli.apigateway.getResources = function(restApiId, callback) {
    awscli.apigateway.exec(
            'get-resources',
            { '--rest-api-id': restApiId },
            callback);
};
awscli.apigateway.getResourceId = function(
        resourcePath, restApiId, callback)
{
    awscli.apigateway.getResources(
            restApiId, function(err, data) {
                if(err) {
                    callback(err, data);
                    return;
                }
                try {
                    var found = false;
                    data.items.forEach(function(item) {
                        if(found) {
                            return;
                        }
                        if(item.path !== resourcePath) {
                            return;
                        }
                        found = true;
                        callback(null, item.id);
                    });
                    if(!found) {
                        callback(null. null);
                    }
                } catch(err) {
                    callback(err, null);
                }
            });
};
awscli.apigateway.createResource = function(
        pathPart, parentId, restApiId, callback)
{
    awscli.apigateway.exec(
            'create-resource', {
                "--path-part": pathPart,
                "--parentId": parentId,
                "--rest-api-id": restApiId
            }, callback);
};
awscli.apigateway.getMethod = function(
        restApiId, resourceId, httpMethod, callback)
{
    awscli.apigateway.exec(
            'get-method',
            {
                '--rest-api-id': restApiId,
                '--resource-id': resourceId,
                '--http-method': httpMethod,
            },
            callback);
};
module.exports = awscli.apigateway;
