(function() {
    "use strict";
    var configure = {};

    // Load ~/.aws/config
    var config = null;
    try {
        var homeDir = require("home-dir");
        var fname = homeDir("/.aws/config");
        var fs = require("fs");
        var ini = require("ini");
        var stat = fs.statSync(fname);
        if(stat.isFile() && !stat.isDirectory()) {
            config = ini.parse(fs.readFileSync(fname, 'utf-8'));
        }
    } catch(ex) {
        // ignore the error.
    }

    configure.getConfig = function() { return config; };
    configure.setConfig = function(cfg) { config = cfg; };

    configure.getConfiguredRegion = function(profile) {
        if(profile) {
            profile = "profile " + profile;
        } else {
            profile = "default";
        }
        if(config) {
            if((profile in config) &&
            ("region" in config[profile]))
            {
                return config[profile].region;
            }
        }
        return null;
    };
    configure.getAwsProfile = function() {
        const PROFILE_ENV = "AWS_PROFILE";
        if(PROFILE_ENV in process.env) {
            return process.env[PROFILE_ENV];
        }
        return null;
    };
    module.exports = configure;
}());
