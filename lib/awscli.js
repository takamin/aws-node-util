var child_process = require('child_process');
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
    awscli.feature = {};
    Object.keys(services).forEach(function (svcName) {
        var svcDef = services[svcName];
        var service = {};
        Object.keys(svcDef.commands).forEach(function(cmdName) {
            var cmdDef = svcDef.commands[cmdName];
            service[cmdName] = function() {
                var args = Array.apply(null, arguments);
                var callback = null;
                if(args.length > 0) {
                    if(typeof(args[args.length - 1]) == "function") {
                        callback = args.splice(-1, 1)[0];
                    }
                }
                var option = {};
                for(var optIdx = 0; optIdx < cmdDef.options.length; optIdx++) {
                    var optDef = cmdDef.options[optIdx];
                    if(optIdx < args.length) {
                        if(args[optIdx] !== null) {
                            option["--" + optDef.name] = args[optIdx];
                        }
                    } else if(optDef.required) {
                        callbackError("ERROR aws." + svc + "." + cmdName + ":"
                            + optDef.name + "is required");
                        return;
                    }
                }
                awscli.exec(svcName, cmdName, option, callback);
            }
        });
        awscli.feature[svcName] = service;
    });
}());
module.exports = awscli;
