(function() {
    var AWS = require("aws-sdk");
    exports.handler = function(event, context) {
        context.fail(event);
    }
}());
