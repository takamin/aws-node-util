#!/bin/env node
(function() {
    "use strict";
    var msysMochaAlt = require("minty-mocha");
    var chai = require('chai');
    var should = chai.should();
    var assert = chai.assert;

    // Tests
    describe("aws-dynamodb", function() {
        var dynamodb = require("../lib/aws-dynamodb.js");
        describe("#parseItemListToMap", function() {
            describe("interpret a literal with its type in automatically", function() {
                describe("integer", function() {
                    it('positive', function() {
                        var item = dynamodb.parseItemListToMap("x=123");
                        assert.equal(item.x.N, "123");
                    });
                    it('zero', function() {
                        var item = dynamodb.parseItemListToMap("x=0");
                        assert.equal(item.x.N, "0");
                    });
                    it('negative', function() {
                        var item = dynamodb.parseItemListToMap("x=-123");
                        assert.equal(item.x.N, "-123");
                    });
                });
                describe("real", function() {
                    it('positive', function() {
                        var item = dynamodb.parseItemListToMap("x=123.456");
                        assert.equal(item.x.N, "123.456");
                    });
                    it('zero', function() {
                        var item = dynamodb.parseItemListToMap("x=0.0");
                        assert.equal(item.x.N, "0.0");
                    });
                    /*
                    it('zero point zero', function() {
                        var item = dynamodb.parseItemListToMap("x=0.0");
                        assert.equal(item.x.N, "0");
                    });
                    describe('omit fraction zero', function() {
                        describe('non zero value', function() {
                            it('positive', function() {
                                var item = dynamodb.parseItemListToMap("x=1.");
                                assert.equal(item.x.N, "1");
                            });
                            it('negative', function() {
                                var item = dynamodb.parseItemListToMap("x=-1.");
                                assert.equal(item.x.N, "1");
                            });
                        });
                        it('zero zero', function() {
                            var item = dynamodb.parseItemListToMap("x=0.");
                            assert.equal(item.x.N, "0");
                        });
                    });
                    describe('omit integer zero', function() {
                        describe('non zero value', function() {
                            it('positive', function() {
                                var item = dynamodb.parseItemListToMap("x=.0");
                                assert.equal(item.x.N, "0.5");
                            });
                            it('negative', function() {
                                var item = dynamodb.parseItemListToMap("x=-.0");
                                assert.equal(item.x.N, "0.5");
                            });
                        });
                        it('zero', function() {
                            var item = dynamodb.parseItemListToMap("x=.0");
                            assert.equal(item.x.N, "0");
                        });
                    });
                    */
                    it('negative', function() {
                        var item = dynamodb.parseItemListToMap("x=-123.456");
                        assert.equal(item.x.N, "-123.456");
                    });
                });
                describe("string", function() {
                    it("with double quotation", function() {
                        var item = dynamodb.parseItemListToMap("x=\"123\"");
                        assert.equal(item.x.S, "123");
                    });
                    it("with single quotation", function() {
                        var item = dynamodb.parseItemListToMap("x='123'");
                        assert.equal(item.x.S, "123");
                    });
                });
                describe("boolean", function() {
                    it("true", function() {
                        var item = dynamodb.parseItemListToMap("x=true");
                        assert.equal(item.x.BOOL, true);
                    });
                    it("false", function() {
                        var item = dynamodb.parseItemListToMap("x=false");
                        assert.equal(item.x.BOOL, false);
                    });
                });
            });
            describe("interpret a map by its name", function() {
                describe("integer", function() {
                    it('positive', function() {
                        var item = dynamodb.parseItemListToMap("m.x=123");
                        assert.equal(item.m.M.x.N, "123");
                    });
                    it('zero', function() {
                        var item = dynamodb.parseItemListToMap("m.x=0");
                        assert.equal(item.m.M.x.N, "0");
                    });
                    it('negative', function() {
                        var item = dynamodb.parseItemListToMap("m.x=-123");
                        assert.equal(item.m.M.x.N, "-123");
                    });
                });
                describe("real", function() {
                    it('positive', function() {
                        var item = dynamodb.parseItemListToMap("m.x=123.456");
                        assert.equal(item.m.M.x.N, "123.456");
                    });
                    it('zero', function() {
                        var item = dynamodb.parseItemListToMap("m.x=0.0");
                        assert.equal(item.m.M.x.N, "0.0");
                    });
                    /*
                    it('zero point zero', function() {
                        var item = dynamodb.parseItemListToMap("m.x=0.0");
                        assert.equal(item.m.M.x.N, "0");
                    });
                    describe('omit fraction zero', function() {
                        describe('non zero value', function() {
                            it('positive', function() {
                                var item = dynamodb.parseItemListToMap("m.x=1.");
                                assert.equal(item.m.M.x.N, "1");
                            });
                            it('negative', function() {
                                var item = dynamodb.parseItemListToMap("m.x=-1.");
                                assert.equal(item.m.M.x.N, "1");
                            });
                        });
                        it('zero zero', function() {
                            var item = dynamodb.parseItemListToMap("m.x=0.");
                            assert.equal(item.m.M.x.N, "0");
                        });
                    });
                    describe('omit integer zero', function() {
                        describe('non zero value', function() {
                            it('positive', function() {
                                var item = dynamodb.parseItemListToMap("m.x=.0");
                                assert.equal(item.m.M.x.N, "0.5");
                            });
                            it('negative', function() {
                                var item = dynamodb.parseItemListToMap("m.x=-.0");
                                assert.equal(item.m.M.x.N, "0.5");
                            });
                        });
                        it('zero', function() {
                            var item = dynamodb.parseItemListToMap("m.x=.0");
                            assert.equal(item.m.M.x.N, "0");
                        });
                    });
                    */
                    it('negative', function() {
                        var item = dynamodb.parseItemListToMap("m.x=-123.456");
                        assert.equal(item.m.M.x.N, "-123.456");
                    });
                });
                describe("string", function() {
                    it("with double quotation", function() {
                        var item = dynamodb.parseItemListToMap("m.x=\"123\"");
                        assert.equal(item.m.M.x.S, "123");
                    });
                    it("with single quotation", function() {
                        var item = dynamodb.parseItemListToMap("m.x='123'");
                        assert.equal(item.m.M.x.S, "123");
                    });
                });
                describe("boolean", function() {
                    it("true", function() {
                        var item = dynamodb.parseItemListToMap("m.x=true");
                        assert.equal(item.m.M.x.BOOL, true);
                    });
                    it("false", function() {
                        var item = dynamodb.parseItemListToMap("m.x=false");
                        assert.equal(item.m.M.x.BOOL, false);
                    });
                });
            });
        });
        describe("#parseProjectionExpression", function() {
            describe("recognize placeholder", function() {
                var exprAttrNames = {};
                var projExpr = dynamodb.parseProjectionExpression(
                        "abort", exprAttrNames);
                it("projectionExpression", function() {
                    assert.equal(projExpr, "#abort");
                });
                it("expressionAttributeNames", function() {
                    assert.equal(
                            JSON.stringify(exprAttrNames),
                            JSON.stringify({"#abort" : "abort"}));
                });
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
