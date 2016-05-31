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
    }

    configure.getConfiguredRegion = function(profile) {
        profile = profile || "default";
        if(config) {
            if((profile in config) &&
            ("region" in config[profile]))
            {
                return config[profile].region;
            }
        }
        return null;
    };
    module.exports = configure;
}());
