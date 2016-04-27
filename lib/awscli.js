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
        try {
            var json = JSON.parse(stdout);
            callback(err, JSON.parse(stdout));
        } catch(ex) {
            if(stdout !== "") {
                callback(err, "No error, but response is not json:" + stdout);
            }
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
                "create-thing" : {
                    "description" : "",
                    "options" : [
                        { "name" : "thing-name", "required" : true },
                        { "name" : "attribute-payload" }
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
                "list-things" : {
                    "options" : [
                    ]
                },
                "get-policy" : {
                    "options" : [
                        { "name" : "policy-name", "required" : true }
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
                            options["--" + option.name] = args[optIdx];
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
