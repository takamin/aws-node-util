(function() {
    "use strict";
    var awscli = require("./awscli");
    awscli.iot = {};
    awscli.iot.exec = function(command, opts, callback){
        awscli.exec('iot', command, opts, callback);
    };
    awscli.iot.createThing = function(thingName, attributePayload, callback) {
        var opts = { "--thing-name" : thingName };
        if(attributePayload) {
            opts["--attribute-payload"] = attributePayload;
        }
        awscli.iot.exec("create-thing", opts, callback);
    };
    awscli.iot.describeThing = function(thingName, callback) {
        awscli.iot.exec("create-thing",
            {
                "--thing-name" : thingName
            },
            callback);
    };
    awscli.iot.deleteThing = function(thingName, callback) {
        awscli.iot.exec("delete-thing",
            {
                "--thing-name" : thingName
            },
            callback);
    };
    awscli.iot.listThings = function(callback) {
        awscli.iot.exec("list-things", { }, callback);
    };
    awscli.iot.getPolicy = function(policyName, callback) {
        awscli.iot.exec("get-policy", {
            "--policy-name" : policyName
        }, callback);
    };
    awscli.iot.listPolicies = function(callback) {
        awscli.iot.exec("list-policies", { }, callback);
    };
    module.exports = awscli.iot;
}());
