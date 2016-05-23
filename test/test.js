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
}());
