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
module.exports = awscli;
