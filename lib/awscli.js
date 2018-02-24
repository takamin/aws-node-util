"use strict";
var camelcase = require("camelcase");
var awscli = {};

awscli.exec = function(serviceName, command, opts, callback) {
    var service = awscli.getService(serviceName);
    var methodName = camelcase(command);
    var camelOpts = {};
    if(opts) {
        Object.keys(opts).forEach(function(key) {
            if(key.match(/^--/)) {
                camelOpts[camelcase(key.replace(/^--/,""))] = opts[key];
            } else {
                camelOpts[key] = opts[key];
            }
        });
    }
    try {
        service[methodName].apply(service, [camelOpts, callback]);
    } catch(err) {
        console.log(serviceName);
        console.log(command);
        console.error(err.stack);
        Object.keys(service.prototype).forEach(function(methodName) {
            console.log("* " + methodName);
        });
    }
};

(function() {

    var AWS = require("aws-sdk");

    awscli.connect = function(config) {
        config = config || {};
        if(!("region" in config)) {
            //
            // Get default region from the file ~/.aws/config
            //
            var aws_configure = require("./aws-configure");
            var region = aws_configure.getConfiguredRegion(aws_configure.getAwsProfile());
            if(region) {
                config.region = region;
                //AWS.config.update({ "region" : region });
            } else {
                console.error("Error: No AWS region name is determined");
                console.error("Set default region using an AWS CLI command `aws configure`.");
                process.exit(1);
            }
        }
        AWS.config.update(config);
    }

    //
    // Get AWS service class instance
    //
    awscli.getService = function (serviceName) {
        if(!(serviceName in AWS)) {
            console.error("ERROR: Invalid AWS service name", serviceName);
            process.exit(1);
        }
        var service = new AWS[serviceName]();
        if(!service) {
            console.error("ERROR: Fail to create AWS service", serviceName);
            process.exit(1);
        }
        return service;
    };

    var callbackError = function(message, callback) {
        if(callback) {
            callback.call(null, message, null);
        }
    };

    awscli.registerAPIs = function(service_name, service_def) {
        var service = {};
        service.connect = awscli.connect;
        Object.keys(service_def.commands).forEach(function(command_name) {
            var function_name = camelcase(command_name);
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
                                    options["--" + option.name] = "";
                                }
                            } else if("extra-option" in option && option["extra-option"]) {
                                Object.keys(args[optIdx]).forEach(function(key) {
                                    if(args[optIdx][key] == null) {
                                        options["--" + key] = "";
                                    } else {
                                        options["--" + key] = args[optIdx][key];
                                    }
                                });
                            } else {
                                options["--" + option.name] = args[optIdx];
                            }
                        }
                    } else if(option.required) {
                        callbackError("ERROR aws." + service_name + "." + function_name + ":"
                            + option.name + "is required");
                        return;
                    }
                }
                awscli.exec(service_name, command_name, options, callback);
            };}(service_def.commands[command_name].options));
        });
        awscli[service_name.toLowerCase()] = service;
        return service;
    }

    /**
     * THIS METHOD MAY NOT BE USED FROM ANY CODES.
     * Convert an object to string for the command line option value
     *
     * @param {object} obj object to stringify.
     * @returns {string} A string that double quotations are escaped.
     */
    awscli.jsonAsQuotedString = function(obj) {
        return '"' + JSON.stringify(obj).replace(/"/g, '\\"') + '"';
    };

}());
module.exports = awscli;
