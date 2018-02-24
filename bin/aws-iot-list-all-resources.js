#!/bin/env node
(function() {
    "use_strict";
    var aws_iot = require('../lib/aws-iot');
    aws_iot.connect();
    var Promise = require('promise');
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
            aws_iot[camelCase("list-" + key)](function(err, list) {
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

    var getDetail = function(list, method, identName) {
        return new Promise(function(resolve, reject) {
            Promise.all(list.map(function(item) {
                return new Promise(function(resolve2, reject2) {
                    method.call(null, item[identName], function(err, data) {
                        if(err) {
                            console.error("ERROR:", err, "on", method.name, "for", item[identName]);
                            reject2(err);
                        } else {
                            item["detail"] = data;
                            resolve2(data);
                        }
                    });
                });
            })).then(function(results) {
                resolve(results);
            }, function(err) {
                console.err(err);
                reject(err);
            });
        });
    };
    var putResourceList = function(resourceName, resourceList, headerRow, callback) {
        var buf = listit.buffer();
        var i = 0;
        buf.d("#");
        buf.d(headerRow);
        resourceList.forEach(function(resource) {
            buf.d(++i);
            callback(buf, resource);
        });
        console.log(resourceName + ":");
        console.log("");
        console.log(buf.toString());
        console.log("");
    };
    try {
        listAllResources(function(err, resources) {
            if(err) {
                console.error(err);
                process.exit(1);
            }
            Promise.all([
                getDetail(resources.things, aws_iot.describeThing, "thingName"),
                getDetail(resources.policies, aws_iot.getPolicy, "policyName"),
                getDetail(resources.certificates, aws_iot.describeCertificate, "certificateId"),
                getDetail(resources.topicRules, aws_iot.getTopicRule, "ruleName")
            ]).then(function() {
                return Promise.all(
                    resources.certificates.map(function (cert) {
                        return new Promise(function (resolve, reject) {
                            aws_iot.listPrincipalPolicies(cert.certificateArn, function(err, data) {
                                if(err) {
                                    reject(err);
                                    return;
                                }
                                if(!("policies" in cert)) {
                                    cert.policies = [];
                                }
                                cert.policies.push(getColumn("policyName", data.policies).join(","));
                                resolve(data);
                            });
                        });
                    }));
            }).then(function() {
                return Promise.all(
                    resources.certificates.map(function (cert) {
                        return new Promise(function (resolve, reject) {
                            aws_iot.listPrincipalThings(cert.certificateArn, function(err, data) {
                                if(err) {
                                    reject(err);
                                    return;
                                }
                                if(!("things" in cert)) {
                                    cert.things = [];
                                }
                                cert.things.push(data.things.join(","));
                                resolve(data)
                            });
                        });
                    }));
            }).then(function (results) {
                putResourceList("Things", resources.things,
                    ["thingName", "attributes", "defaultClientId" ],
                    function(listItBuf, thing) {
                        listItBuf.d([
                            thing.thingName,
                            JSON.stringify(thing.attributes),
                            thing.detail.defaultClientId
                        ]);
                    }
                );
                putResourceList("Policies", resources.policies,
                    ["policyName", "defaultVersionId"],
                    function(listItBuf, policy) {
                        listItBuf.d([
                            policy.policyName,
                            policy.detail.defaultVersionId
                        ]);
                    }
                );
                var certificateIds = getColumn("certificateId", resources.certificates);
                var identLength = getIdentLength(certificateIds, 7);
                putResourceList("Certificates", resources.certificates,
                    ["id(abbr)", "status", "things", "policies", "creationDate", "lastModifiedDate", "ownedBy"],
                    function(listItBuf, certificate) {
                        listItBuf.d([
                                certificate.certificateId.substr(0, identLength),
                                certificate.status,
                                certificate.things.join(','),
                                certificate.policies.join(','),
                                certificate.creationDate,
                                certificate.detail.certificateDescription.lastModifiedDate,
                                certificate.detail.certificateDescription.ownedBy
                            ]);
                    }
                );
                putResourceList("TopicRules", resources.topicRules,
                    ["ruleName", "topicPattern", "ruleDisabled", "createdAt", "rule.actions"],
                    function(listItBuf, topicRule) {
                        listItBuf.d([
                            topicRule.ruleName,
                            topicRule.topicPattern,
                            topicRule.ruleDisabled,
                            topicRule.createdAt,
                            topicRule.detail.rule.actions.map(function(action) {
                                return Object.keys(action).join("/");
                            }).join("/")
                        ]);
                    }
                );
                return results;
            }, function(err) {
                console.error(err);
            });
            
        });
    } catch(ex) {
        console.error(ex.toString());
        process.exit(1);
    }
}());
