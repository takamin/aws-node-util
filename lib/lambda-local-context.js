(function() {
    "use strict";
    var Context = function() { }
    Context.prototype.fail = function(err) {
        console.error("fail:", JSON.stringify(err));
        process.exit(1);
    };
    Context.prototype.succeed = function(result) {
        console.log("succeed:", JSON.stringify(result));
        process.exit(0);
    };
    Context.prototype.done = function(err, result) {
        if(err) {
            this.fail(err);
        }
        this.succeed(result);
    };
    module.exports = {
        "context" : new Context()
    };
}());
