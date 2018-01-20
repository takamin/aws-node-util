var awscli = require("./awscli");
module.exports = awscli.registerAPIs("Iot", {
    "description" : "",
    "commands": {
        "attach-principal-policy" : {
            "description" : "",
            "options" : [
                { "name" : "policy-name", "required" : true },
                { "name" : "principal", "required" : true }
            ]
        },
        "attach-thing-principal" : {
            "description" : "",
            "options" : [
                { "name" : "thing-name", "required" : true },
                { "name" : "principal", "required" : true }
            ]
        },
        "create-keys-and-certificate" : {
            "description" : "",
            "options" : [
                { "name" : "set-as-active", "no-arg": true }
            ]
        },
        "create-policy" : {
            "description" : "",
            "options" : [
                { "name" : "policy-name", "required" : true },
                { "name" : "policy-document", "required" : true }
            ]
        },
        "create-thing" : {
            "description" : "",
            "options" : [
                { "name" : "thing-name", "required" : true },
                { "name" : "attribute-payload" }
            ]
        },
        "describe-certificate" : {
            "options" : [
                { "name" : "certificate-id", "required" : true }
            ]
        },
        "describe-thing" : {
            "options" : [
                { "name" : "thing-name", "required" : true }
            ]
        },
        "delete-thing" : {
            "options" : [
                { "name" : "thing-name", "required" : true }
            ]
        },
        "list-certificates" : {
            "options" : [ ]
        },
        "list-principal-policies" : {
            "options" : [
                { "name" : "principal", "required" : true }
            ]
        },
        "list-principal-things" : {
            "options" : [
                { "name" : "principal", "required" : true }
            ]
        },
        "list-thing-principals" : {
            "options" : [
                { "name" : "thing-name", "required" : true }
            ]
        },
        "list-topic-rules" : {
            "options" : [ ]
        },
        "list-things" : {
            "options" : [ ]
        },
        "get-policy" : {
            "options" : [
                { "name" : "policy-name", "required" : true }
            ]
        },
        "get-topic-rule" : {
            "options" : [
                { "name" : "rule-name", "required" : true }
            ]
        },
        "list-policies" : {
            "options" : [ ]
        }
    }
});
