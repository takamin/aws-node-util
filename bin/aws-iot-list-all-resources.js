#!/usr/bin/node
(function() {
    "use_strict";
    var aws = require('../lib/awscli');
    const camelCase = require('camelcase');
    var listit = require('list-it');
    var getIdentLength = function(ids, minLength) {
        var maxLength = 0;
        ids.forEach(function(id) {
            var len = id.length;
            if(len > maxLength) {
                maxLength = len;
            }
        });
        for(var len = minLength; len < maxLength; len++) {
            var ident = true;
            var identifier = {};
            for(var i = 0; i < ids.length; i++) {
                var shortenId = ids[i].substr(0, len);
                if(shortenId in identifier) {
                    ident = false;
                    break;
                }
                identifier[shortenId] = true;
            }
            if(ident) {
                return len;
            }
        }
        return maxLength;
    };
    var getColumn = function(jsonPath, arr) {
        return arr.map(function(element) {
            return eval('('
                    + JSON.stringify(element)
                    + "." + jsonPath + ')');
        });
    };
    function listAllResources(callback) {
        var resourceNames = [ "certificates", "topicRules", "things", "policies" ];
        var resources = {};
        resourceNames.forEach(function(key) {
            resources[key] = null;
        });
        var onReceiveResourceList = function(resourceName, resourceList) {
            if(resourceName in resources) {
                resources[resourceName] = resourceList;
            }
            var receiveAll = true;
            for(var i = 0; i < resourceNames.length; i++) {
                if(resources[resourceNames[i]] == null) {
                    receiveAll = false;
                    break;
                }
            }
            if(receiveAll) {
                callback(null, resources);
            }
        }
        resourceNames.forEach(function(key) {
            aws.iot[camelCase("list-" + key)](function(err, list) {
                if(err) {
                    console.error(err);
                    process.exit(1);
                }
                var keys = Object.keys(list);
                if(keys.length > 0) {
                    onReceiveResourceList(key, list[keys[0]]);
                }
            });
        });
    }
    try {
        listAllResources(function(err, resources) {
            if(err) {
                console.error(err);
                process.exit(1);
            }
            //Things
            var putResourceList = function(resourceName, resourceList, callback) {
                var buf = listit.buffer();
                resourceList.forEach(function(resource) {
                    callback(buf, resource);
                });
                console.log(resourceName + ":");
                console.log(buf.toString());
            };
            putResourceList("Things", resources.things,
                function(listItBuf, thing) {
                    listItBuf.d([
                        thing.thingName,
                        JSON.stringify(thing.attributes)
                    ]);
                }
            );
            putResourceList("Policies", resources.policies,
                function(listItBuf, policy) {
                    listItBuf.d([
                        policy.policyName
                    ]);
                }
            );

            //var certificateIds = resources.certificates.map(function(certificate) {
            //    return certificate.certificateId; });
            var certificateIds = getColumn("certificateId", resources.certificates);
            var identLength = getIdentLength(certificateIds, 7);
            putResourceList("Certificates", resources.certificates,
                function(listItBuf, certificate) {
                    listItBuf.d([
                            certificate.certificateId.substr(0, identLength),
                            certificate.status,
                            certificate.creationDate
                        ]);
                }
            );
            putResourceList("TopicRules", resources.topicRules,
                function(listItBuf, topicRule) {
                    listItBuf.d([
                        topicRule.ruleName,
                        topicRule.topicPattern,
                        topicRule.ruleDisabled,
                        topicRule.createdAt
                    ]);
                }
            );
        });
    } catch(ex) {
        console.error(ex.toString());
        process.exit(1);
    }
}());
