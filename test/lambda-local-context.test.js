#!/bin/env node
"use strict";
var chai = require('chai');
var assert = chai.assert;
var exec = require('child_process').exec;

describe("lambda-local-context", function() {
    //
    // Test lambda local context's exit code and console output
    //
    it("should be expected output and exit code", () => {
        var command_prefix = "node test/LambdaContext/testExitCode.js ";
        var testset = [
            {
                "lambda": "OnFail",
                "expected": {
                    "exitcode": 1,
                    "stdout": null,
                    "stderr": {"code":"AAA","message":"BBB"}
                }, "result":{}
            },
            {
                "lambda": "OnSucceed",
                "expected" : {
                    "exitcode": 0,
                    "stdout": {"code":"AAA","message":"BBB"},
                    "stderr": null
                }, "result":{}
            },
            {
                "lambda": "DoneOnFail",
                "expected" : {
                    "exitcode": 1,
                    "stdout": null,
                    "stderr": {"code":"AAA","message":"BBB"}
                }, "result":{}
            },
            {
                "lambda": "DoneOnSucceed",
                "expected" : {
                    "exitcode": 0,
                    "stdout": {"code":"AAA","message":"BBB"},
                    "stderr": null
                }, "result":{}
            }
        ];
        var resultExitCode = [];
        var resultConsole = [];
        testset.forEach(function (test) {
            var param = { "code": "AAA", "message" : "BBB" };
            var param_cl = JSON.stringify(param).replace(/"/g, '\\"')
            exec(
                command_prefix + test.lambda + ' "' + param_cl + '"',
                function (err, stdout, stderr) {
                    test.result.stdout = (stdout ? JSON.parse(stdout.replace(/^[^:]*:/, '')) : null);
                    test.result.stderr = (stderr ? JSON.parse(stderr.replace(/^[^:]*:/, '')) : null);
                    resultConsole.push(test);
                    if(resultConsole.length == testset.length) {
                        resultConsole.forEach(function(con) {
                            describe(con.lambda, function() {
                                assert.equal(
                                    JSON.stringify(con.result.stdout),
                                    JSON.stringify(con.expected.stdout));
                                assert.equal(
                                    JSON.stringify(con.result.stderr),
                                    JSON.stringify(con.expected.stderr));
                            });
                        });
                    }
                }).addListener("exit", function(exit) {
                    test.result.exitcode = exit;
                    resultExitCode.push(test);
                    if(resultExitCode.length == testset.length) {
                        resultExitCode.forEach(function(result) {
                            assert.equal(
                                result.result.exitcode,
                                result.expected.exitcode);
                        });
                    }
                });
        });
    });
});
