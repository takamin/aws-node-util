#!/bin/env node
/* eslint no-unused-vars: 0 */
var reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
var lines=[];
reader.on('line', function (line) {
    lines.push(line);
});
reader.on('close', function () {
    let inputJson = JSON.parse(lines.join(''));
    let code = "(inputJson." + process.argv[2] + ")";
    let outputJson = eval(code);
    if(typeof(outputJson) === "object") {
        console.log(JSON.stringify(outputJson));
    } else {
        console.log(outputJson);
    }
    process.exit(0);
});
