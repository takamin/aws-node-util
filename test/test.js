#!/bin/env node
(function() {
    "use strict";
    var msysMochaAlt = require("../lib/msys-mocha-alt");
    var describe = msysMochaAlt.get_describe();
    var it = msysMochaAlt.get_it();
    var chai = require('chai');
    var should = chai.should();
    var assert = chai.assert;

    // Tests
    describe("aws-dynamodb", function() {
        var dynamodb = require("../lib/aws-dynamodb.js");
        describe("#parseItemListToMap", function() {
            it('interpret an integer', function() {
                var item = dynamodb.parseItemListToMap("x=123");
                assert.equal(item.x.N, "123");
            });
            it('interpret a float', function() {
                var item = dynamodb.parseItemListToMap("x=123.456");
                assert.equal(item.x.N, "123.456");
            });
            it('interpret an negative integer', function() {
                var item = dynamodb.parseItemListToMap("x=-123");
                assert.equal(item.x.N, "-123");
            });
            it('interpret an negative float', function() {
                var item = dynamodb.parseItemListToMap("x=-123.456");
                assert.equal(item.x.N, "-123.456");
            });
        });
    });
    //
    // Test lambda local context's exit code and console output
    //
    (function() {
        var exec = require('child_process').exec;
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
            var childProcess = exec(
                command_prefix + test.lambda + ' "' + param_cl + '"',
                function (err, stdout, stderr) {
                    test.result.stdout = (stdout ? JSON.parse(stdout.replace(/^[^\:]*\:/, '')) : null);
                    test.result.stderr = (stderr ? JSON.parse(stderr.replace(/^[^\:]*\:/, '')) : null);
                    resultConsole.push(test);
                    if(resultConsole.length == testset.length) {
                        describe("lambda-local-context", function() {
                            describe("console output", function() {
                                resultConsole.forEach(function(con) {
                                    describe(con.lambda, function() {
                                        it("stdout", function() {
                                            assert.equal(
                                                JSON.stringify(con.result.stdout),
                                                JSON.stringify(con.expected.stdout));
                                        });
                                        it("stderr", function() {
                                            assert.equal(
                                                JSON.stringify(con.result.stderr),
                                                JSON.stringify(con.expected.stderr));
                                        });
                                    });
                                });
                            });
                        });
                    }
                }).addListener("exit", function(exit, signal) {
                    test.result.exitcode = exit;
                    resultExitCode.push(test);
                    if(resultExitCode.length == testset.length) {
                        describe("lambda-local-context", function() {
                            describe("exit-code", function() {
                                resultExitCode.forEach(function(result) {
                                    it(result.lambda, function() {
                                        assert.equal(
                                            result.result.exitcode,
                                            result.expected.exitcode);
                                    });
                                });
                            });
                        });
                    }
                });
        });
    }());
}());
