"use strict";
var chai = require("chai");
var assert = chai.assert;
var DynamoDbDataType = require("../lib/dynamodb-data-type");
describe("DynamoDbDataType", function() {
    describe("class method primaryTypeOf", function() {
        it("should detect null", function() {
            var value = null;
            assert.equal("null", DynamoDbDataType.primaryTypeOf(value));
        });
        it("should detect Buffer", function() {
            var value = Buffer.from("abc", "base64");
            assert.equal("Buffer", DynamoDbDataType.primaryTypeOf(value));
        });
        it("should detect Array", function() {
            var value = [1,2,3];
            assert.equal("Array", DynamoDbDataType.primaryTypeOf(value));
        });
        it("should detect blank string", function() {
            var value = "";
            assert.equal("string", DynamoDbDataType.primaryTypeOf(value));
        });
        it("should detect string", function() {
            var value = "string";
            assert.equal("string", DynamoDbDataType.primaryTypeOf(value));
        });
        it("should detect string", function() {
            var value = "1.23";
            assert.equal("string", DynamoDbDataType.primaryTypeOf(value));
        });
        it("should detect number for 1.23", function() {
            var value = 1.23;
            assert.equal("number", DynamoDbDataType.primaryTypeOf(value));
        });
        it("should detect number for 0", function() {
            var value = 0;
            assert.equal("number", DynamoDbDataType.primaryTypeOf(value));
        });
        it("should detect boolean for true", function() {
            var value = true;
            assert.equal("boolean", DynamoDbDataType.primaryTypeOf(value));
        });
        it("should detect boolean for false", function() {
            var value = false;
            assert.equal("boolean", DynamoDbDataType.primaryTypeOf(value));
        });
        it("should detect undefined", function() {
            var value = undefined;
            assert.equal("undefined", DynamoDbDataType.primaryTypeOf(value));
        });
    });
    describe("countPossibleType", function() {
        it("should returns 4 possibilities after construction", function() {
            var detector = new DynamoDbDataType();
            assert.equal(4, detector.countPossibleType());
        });
        it("should returns number of possibilities", function() {
            var detector = new DynamoDbDataType();

            //0
            detector._is.BufferSet = false;
            detector._is.NumberSet = false;
            detector._is.StringSet = false;
            detector._is.List = false;
            assert.equal(0, detector.countPossibleType());
            detector._is.BufferSet = true;
            detector._is.NumberSet = false;
            detector._is.StringSet = false;
            detector._is.List = false;

            //1
            assert.equal(1, detector.countPossibleType());
            detector._is.BufferSet = false;
            detector._is.NumberSet = true;
            detector._is.StringSet = false;
            detector._is.List = false;
            assert.equal(1, detector.countPossibleType());
            detector._is.BufferSet = false;
            detector._is.NumberSet = false;
            detector._is.StringSet = true;
            detector._is.List = false;
            assert.equal(1, detector.countPossibleType());
            detector._is.BufferSet = false;
            detector._is.NumberSet = false;
            detector._is.StringSet = false;
            detector._is.List = true;
            assert.equal(1, detector.countPossibleType());

            //2
            detector._is.BufferSet = true;
            detector._is.NumberSet = true;
            detector._is.StringSet = false;
            detector._is.List = false;
            assert.equal(2, detector.countPossibleType());
            detector._is.BufferSet = true;
            detector._is.NumberSet = false;
            detector._is.StringSet = true;
            detector._is.List = false;
            assert.equal(2, detector.countPossibleType());
            detector._is.BufferSet = true;
            detector._is.NumberSet = false;
            detector._is.StringSet = false;
            detector._is.List = true;
            assert.equal(2, detector.countPossibleType());
            detector._is.BufferSet = false;
            detector._is.NumberSet = true;
            detector._is.StringSet = true;
            detector._is.List = false;
            assert.equal(2, detector.countPossibleType());
            detector._is.BufferSet = false;
            detector._is.NumberSet = true;
            detector._is.StringSet = false;
            detector._is.List = true;
            assert.equal(2, detector.countPossibleType());
            detector._is.BufferSet = false;
            detector._is.NumberSet = false;
            detector._is.StringSet = true;
            detector._is.List = true;
            assert.equal(2, detector.countPossibleType());

            //3
            detector._is.BufferSet = true;
            detector._is.NumberSet = true;
            detector._is.StringSet = true;
            detector._is.List = false;
            assert.equal(3, detector.countPossibleType());
            detector._is.BufferSet = true;
            detector._is.NumberSet = true;
            detector._is.StringSet = false;
            detector._is.List = true;
            assert.equal(3, detector.countPossibleType());
            detector._is.BufferSet = true;
            detector._is.NumberSet = false;
            detector._is.StringSet = true;
            detector._is.List = true;
            assert.equal(3, detector.countPossibleType());
            detector._is.BufferSet = false;
            detector._is.NumberSet = true;
            detector._is.StringSet = true;
            detector._is.List = true;
            assert.equal(3, detector.countPossibleType());

            //4
            detector._is.BufferSet = true;
            detector._is.NumberSet = true;
            detector._is.StringSet = true;
            detector._is.List = true;
            assert.equal(4, detector.countPossibleType());
        });
    });
    describe("getPossibleType", function() {
        it("should returns false after construction", function() {
            var detector = new DynamoDbDataType();
            assert.equal(false, detector.getPossibleType());
        });
        it("should returns null", function() {
            var detector = new DynamoDbDataType();
            detector._is.BufferSet = false;
            detector._is.NumberSet = false;
            detector._is.StringSet = false;
            detector._is.List = false;
            assert.equal(null, detector.getPossibleType());
        });
        it("should returns BufferSet", function() {
            var detector = new DynamoDbDataType();
            detector._is.BufferSet = true;
            detector._is.NumberSet = false;
            detector._is.StringSet = false;
            detector._is.List = false;
            assert.equal("BufferSet", detector.getPossibleType());
        });
        it("should returns NumberSet", function() {
            var detector = new DynamoDbDataType();
            detector._is.BufferSet = false;
            detector._is.NumberSet = true;
            detector._is.StringSet = false;
            detector._is.List = false;
            assert.equal("NumberSet", detector.getPossibleType());
        });
        it("should returns StringSet", function() {
            var detector = new DynamoDbDataType();
            detector._is.BufferSet = false;
            detector._is.NumberSet = false;
            detector._is.StringSet = true;
            detector._is.List = false;
            assert.equal("StringSet", detector.getPossibleType());
        });
        it("should returns List", function() {
            var detector = new DynamoDbDataType();
            detector._is.BufferSet = false;
            detector._is.NumberSet = false;
            detector._is.StringSet = false;
            detector._is.List = true;
            assert.equal("List", detector.getPossibleType());
        });
        it("should returns false when there are 2 or more possibilities", function() {
            var detector = new DynamoDbDataType();

            //2
            detector._is.BufferSet = true;
            detector._is.NumberSet = true;
            detector._is.StringSet = false;
            detector._is.List = false;
            assert.equal(false, detector.getPossibleType());
            detector._is.BufferSet = true;
            detector._is.NumberSet = false;
            detector._is.StringSet = true;
            detector._is.List = false;
            assert.equal(false, detector.getPossibleType());
            detector._is.BufferSet = true;
            detector._is.NumberSet = false;
            detector._is.StringSet = false;
            detector._is.List = true;
            assert.equal(false, detector.getPossibleType());
            detector._is.BufferSet = false;
            detector._is.NumberSet = true;
            detector._is.StringSet = true;
            detector._is.List = false;
            assert.equal(false, detector.getPossibleType());
            detector._is.BufferSet = false;
            detector._is.NumberSet = true;
            detector._is.StringSet = false;
            detector._is.List = true;
            assert.equal(false, detector.getPossibleType());
            detector._is.BufferSet = false;
            detector._is.NumberSet = false;
            detector._is.StringSet = true;
            detector._is.List = true;
            assert.equal(false, detector.getPossibleType());

            //3
            detector._is.BufferSet = true;
            detector._is.NumberSet = true;
            detector._is.StringSet = true;
            detector._is.List = false;
            assert.equal(false, detector.getPossibleType());
            detector._is.BufferSet = true;
            detector._is.NumberSet = true;
            detector._is.StringSet = false;
            detector._is.List = true;
            assert.equal(false, detector.getPossibleType());
            detector._is.BufferSet = true;
            detector._is.NumberSet = false;
            detector._is.StringSet = true;
            detector._is.List = true;
            assert.equal(false, detector.getPossibleType());
            detector._is.BufferSet = false;
            detector._is.NumberSet = true;
            detector._is.StringSet = true;
            detector._is.List = true;
            assert.equal(false, detector.getPossibleType());

            //4
            detector._is.BufferSet = true;
            detector._is.NumberSet = true;
            detector._is.StringSet = true;
            detector._is.List = true;
            assert.equal(false, detector.getPossibleType());
        });
    });
    describe("getPredictedType", function() {
        it("should returns false after construction", function() {
            var detector = new DynamoDbDataType();
            assert.equal(false, detector.getPredictedType());
        });
        it("should returns null", function() {
            var detector = new DynamoDbDataType();
            detector._is.BufferSet = false;
            detector._is.NumberSet = false;
            detector._is.StringSet = false;
            detector._is.List = false;
            assert.equal(null, detector.getPredictedType());
        });
        it("should returns BufferSet", function() {
            var detector = new DynamoDbDataType();
            detector._is.BufferSet = true;
            detector._is.NumberSet = false;
            detector._is.StringSet = false;
            detector._is.List = false;
            assert.equal("BufferSet", detector.getPredictedType());
        });
        it("should returns NumberSet", function() {
            var detector = new DynamoDbDataType();
            detector._is.BufferSet = false;
            detector._is.NumberSet = true;
            detector._is.StringSet = false;
            detector._is.List = false;
            assert.equal("NumberSet", detector.getPredictedType());
        });
        it("should returns StringSet", function() {
            var detector = new DynamoDbDataType();
            detector._is.BufferSet = false;
            detector._is.NumberSet = false;
            detector._is.StringSet = true;
            detector._is.List = false;
            assert.equal("StringSet", detector.getPredictedType());
        });
        describe("the possibility of List is lower than other candidate", function() {
            it("should returns BufferSet", function() {
                var detector = new DynamoDbDataType();
                detector._is.BufferSet = true;
                detector._is.NumberSet = false;
                detector._is.StringSet = false;
                detector._is.List = true;
                assert.equal("BufferSet", detector.getPredictedType());
            });
            it("should returns NumberSet", function() {
                var detector = new DynamoDbDataType();
                detector._is.BufferSet = false;
                detector._is.NumberSet = true;
                detector._is.StringSet = false;
                detector._is.List = true;
                assert.equal("NumberSet", detector.getPredictedType());
            });
            it("should returns StringSet", function() {
                var detector = new DynamoDbDataType();
                detector._is.BufferSet = false;
                detector._is.NumberSet = false;
                detector._is.StringSet = true;
                detector._is.List = true;
                assert.equal("StringSet", detector.getPredictedType());
            });
        });
        it("should returns List", function() {
            var detector = new DynamoDbDataType();
            detector._is.BufferSet = false;
            detector._is.NumberSet = false;
            detector._is.StringSet = false;
            detector._is.List = true;
            assert.equal("List", detector.getPredictedType());
        });
        it("should returns false when there are 2 or more possibilities", function() {
            var detector = new DynamoDbDataType();

            //2
            detector._is.BufferSet = true;
            detector._is.NumberSet = true;
            detector._is.StringSet = false;
            detector._is.List = false;
            assert.equal(false, detector.getPredictedType());
            detector._is.BufferSet = true;
            detector._is.NumberSet = false;
            detector._is.StringSet = true;
            detector._is.List = false;
            assert.equal(false, detector.getPredictedType());
            detector._is.BufferSet = false;
            detector._is.NumberSet = true;
            detector._is.StringSet = true;
            detector._is.List = false;
            assert.equal(false, detector.getPredictedType());

            //3
            detector._is.BufferSet = true;
            detector._is.NumberSet = true;
            detector._is.StringSet = true;
            detector._is.List = false;
            assert.equal(false, detector.getPredictedType());
            detector._is.BufferSet = true;
            detector._is.NumberSet = true;
            detector._is.StringSet = false;
            detector._is.List = true;
            assert.equal(false, detector.getPredictedType());
            detector._is.BufferSet = true;
            detector._is.NumberSet = false;
            detector._is.StringSet = true;
            detector._is.List = true;
            assert.equal(false, detector.getPredictedType());
            detector._is.BufferSet = false;
            detector._is.NumberSet = true;
            detector._is.StringSet = true;
            detector._is.List = true;
            assert.equal(false, detector.getPredictedType());

            //4
            detector._is.BufferSet = true;
            detector._is.NumberSet = true;
            detector._is.StringSet = true;
            detector._is.List = true;
            assert.equal(false, detector.getPredictedType());
        });
    });
    describe("class method detect", function() {
        it("should returns null for null", function() {
            assert.equal("null", DynamoDbDataType.detect(null));
        });
        it("should returns string", function() {
            assert.equal("string", DynamoDbDataType.detect(""));
        });
        it("should returns number", function() {
            assert.equal("number", DynamoDbDataType.detect(1.23));
        });
        it("should returns boolean", function() {
            assert.equal("boolean", DynamoDbDataType.detect(true));
            assert.equal("boolean", DynamoDbDataType.detect(false));
        });
        it("should returns object", function() {
            assert.equal("object", DynamoDbDataType.detect({}));
        });
        it("should returns undefined", function() {
            assert.equal("undefined", DynamoDbDataType.detect(undefined));
        });
        it("should returns Buffer", function() {
            assert.equal("Buffer", DynamoDbDataType.detect(
                    new Buffer.from("abc", "base64")));
        });
        it("should returns BufferSet", function() {
            assert.equal("BufferSet", DynamoDbDataType.detect([
                new Buffer.from("abc", "base64"),
                new Buffer.from("abc", "base64"),
                new Buffer.from("abc", "base64")]));
        });
        it("should returns NumberSet", function() {
            assert.equal("NumberSet", DynamoDbDataType.detect([ 1 ]));
            assert.equal("NumberSet", DynamoDbDataType.detect([ 1,2,3 ]));
        });
        it("should returns StringSet", function() {
            assert.equal("StringSet", DynamoDbDataType.detect([ "1" ]));
            assert.equal("StringSet", DynamoDbDataType.detect([
                    "1","2","3" ]));
        });
        it("should returns List", function() {
            assert.equal("List", DynamoDbDataType.detect([ "1", 2 ]));
            assert.equal("List", DynamoDbDataType.detect([ true ]));
            assert.equal("List", DynamoDbDataType.detect([ false ]));
            assert.equal("List", DynamoDbDataType.detect([ true, false ]));
            assert.equal("List", DynamoDbDataType.detect([ {} ]));
            assert.equal("List", DynamoDbDataType.detect([ [] ]));
        });
    });
});
