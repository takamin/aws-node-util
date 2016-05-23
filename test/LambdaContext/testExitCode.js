#!/bin/env node
(function() {
    "use strict";
    var LL = require("../../lib/lambda-local-context.js");
    var target = require("./" + process.argv[2] + "/index.js");
    var event = JSON.parse(process.argv[3]);
    target.handler(event, LL.context);
    process.exit(2);
}());
