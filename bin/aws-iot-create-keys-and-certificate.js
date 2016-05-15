#!/bin/node
(function() {
    "use strict";
    var fs = require("fs");
    var aws = require("../lib/awscli");
    var cmdlin = require("node-getopt").create([
            ["a",   "activate", "set as activate"],
            ["t",   "thing-name=ARG", "attach the thing"],
            ["p",   "policy-name=ARG", "attach the policy"],
            ["h",   "help",     "display this help"]
            ]).bindHelp().parseSystem();
    var activate = cmdlin.options["activate"];
    aws.iot.createKeysAndCertificate(activate, function(err, data) {
        if(err) {
            console.error("Error: ", err);
            process.exit(1);
        }
        var shortId = data.certificateId.substr(0,7);
        var postFix = "";
        var index = 1;
        var fn = null;
        while(fn == null) {
            var fncan = "cert-" + shortId + postFix + ".json";
            try {
                fs.statSync(fncan);
                ++index;
                postFix = "-" + index;
            } catch(ex) {
                fn = fncan;
            }
        }
        fs.writeFileSync(fn, JSON.stringify(data, null, "    "));
        if(cmdlin.options["thing-name"]) {
            aws.iot.attachThingPrincipal(
                    cmdlin.options["thing-name"],
                    data.certificateArn,
                    function(err, data) {
                        if(err) {
                            console.error("Error: ", err);
                            process.exit(1);
                        }
                    });
        }
        if(cmdlin.options["policy-name"]) {
            aws.iot.attachPrincipalPolicy(
                    cmdlin.options["policy-name"],
                    data.certificateArn,
                    function(err, data) {
                        if(err) {
                            console.error("Error: ", err);
                            process.exit(1);
                        }
                    });
        }
    });
}());
