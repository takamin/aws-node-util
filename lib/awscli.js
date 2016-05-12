var child_process = require('child_process');
var camelcase = require("camelcase");
var awscli = {};
awscli.exec = function(service, command, opts, callback) {
    var cmdlin = ["aws ", service, command];
    opts = opts || {};
    Object.keys(opts).forEach(function(opt) {
        if(opt !== "") {
            cmdlin.push(opt);
        }
        cmdlin.push(opts[opt]);
    });
    child_process.exec(cmdlin.join(' '), function(err, stdout, stderr) {
        if(stderr !== "") {
            console.error(stderr);
        }
        if(err) {
            console.error(err);
        }
        var json = null;
        try {
            json = JSON.parse(stdout);
        } catch(ex) {
            console.error("EXCEPTION at JSON.parse:", ex.toString());
            console.error("stdout:", stdout);
            process.exit(1);
        }
        if(json != null) {
            callback(err, json);
        }
    });
};
(function() {
    "use strict";

    // Declare the AWS CLI commands
    var services = {
        "iot" : {
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
                    "options" : [
                    ]
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
                    "options" : [
                    ]
                },
                "list-things" : {
                    "options" : [
                    ]
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
                    "options" : [
                    ]
                }
            }
        }
    };
    var callbackError = function(message, callback) {
        if(callback) {
            callback.call(null, error, null);
        }
    };

    //
    // Create function to call the command through AWS CLI
    //
    Object.keys(services).forEach(function (service_name) {
        var service_def = services[service_name];
        var service = {};
        Object.keys(service_def.commands).forEach(function(command_name) {
            var function_name = camelcase(command_name);
            console.log("aws." + service_name + "." + function_name);
            service[function_name] = (function(command_options) { return function() {
                var args = Array.apply(null, arguments);
                var callback = null;
                if(args.length > 0) {
                    if(typeof(args[args.length - 1]) === typeof(function(){})) {
                        callback = args.splice(-1, 1)[0];
                    }
                }
                var options = {};
                for(var optIdx = 0; optIdx < command_options.length; optIdx++) {
                    var option = command_options[optIdx];
                    if(optIdx < args.length) {
                        if(args[optIdx] !== null) {
                            if("no-arg" in option && option["no-arg"]) {
                                if(args[optIdx]) {
                                    options["--" + option.name] = args[optIdx];
                                }
                            } else {
                                options["--" + option.name] = args[optIdx];
                            }
                        }
                    } else if(option.required) {
                        callbackError("ERROR aws." + svc + "." + function_name + ":"
                            + option.name + "is required");
                        return;
                    }
                }
                console.log("aws " + service_name + " " + command_name + " ",
                        JSON.stringify(options) + ",",  callback, ")");
                awscli.exec(service_name, command_name, options, callback);
            };}(service_def.commands[command_name].options));
        });
        awscli[service_name] = service;
    });
}());
module.exports = awscli;
