(function() {
    "use strict";
    var awscli = require("./awscli");
    awscli.iot = {};
    awscli.iot.exec = function(command, opts, callback){
        awscli.exec('iot', command, opts, callback);
    };
    awscli.iot.createThing = function(thingName, attributePayload, callback) {
        awscli.feature.iot["create-thing"].apply(null, Array.apply(null, arguments));
    };
    awscli.iot.describeThing = function(thingName, callback) {
        awscli.feature.iot["describe-thing"].apply(null, Array.apply(null, arguments));
    };
    awscli.iot.deleteThing = function(thingName, callback) {
        awscli.feature.iot["delete-thing"].apply(null, Array.apply(null, arguments));
    };
    awscli.iot.listThings = function(callback) {
        awscli.feature.iot["list-things"].apply(null, Array.apply(null, arguments));
    };
    awscli.iot.getPolicy = function(policyName, callback) {
        awscli.feature.iot["get-policy"].apply(null, Array.apply(null, arguments));
    };
    awscli.iot.listPolicies = function(callback) {
        awscli.feature.iot["list-policies"].apply(null, Array.apply(null, arguments));
    };
    module.exports = awscli.iot;
}());
