"use strict";
const assert = require("chai").assert;
const RunnablePutItemStatement = require("../lib/runnable-put-item-statement.js");
describe("RunnablePutItemStatement", () => {
    describe("classifyValuesAndPlaceholders", () => {
        let statement = new RunnablePutItemStatement(
            ["INSERT INTO stars (",
                "mainStar, role, orbitOrder, name",
            ") VALUES (",
                "'SUN', 'planet', 10, 'X'",
            ")"].join(" "));
        describe("set array", () => {
            it("returns an array same to the parameter as values", () => {
                var args = statement.classifyValuesAndPlaceholders(
                    ["A",1,"B"]);
                assert.deepEqual(
                    ["A",1,"B"], args.values);
            });
            it("returns empty object as placeholders", () => {
                var args = statement.classifyValuesAndPlaceholders(
                    ["A",1,"B"]);
                assert.deepEqual(
                    {}, args.placeholders);
            });
        });
        describe("set object", () => {
            it("should return null as value when the values are not contained", () => {
                var args = statement.classifyValuesAndPlaceholders(
                    { ":A": 1, ":B": "C" });
                assert.equal(null, args.values);
            });
            it("should return an array as value when the placeholders are not contained", () => {
                var args = statement.classifyValuesAndPlaceholders(
                    { "X": "A", "Y": 1, "Z": "B" });
                assert.deepEqual(
                    { "X": "A", "Y": 1, "Z": "B" }, args.values);
            });
            it("should return placeholders when the values are not contained", () => {
                var args = statement.classifyValuesAndPlaceholders(
                    { ":A": 1, ":B": "C" });
                assert.deepEqual(
                    { ":A": 1, ":B": "C" }, args.placeholders);
            });
            it("should return values when both of values and placeholders are contained", () => {
                var args = statement.classifyValuesAndPlaceholders(
                    { ":A": 1, "X": "A", ":B": "C", "Y": 1, "Z": "B" });
                assert.deepEqual(
                    { "X": "A", "Y": 1, "Z": "B" }, args.values);
            });
            it("should return placeholders when both of values and placeholders are contained", () => {
                var args = statement.classifyValuesAndPlaceholders(
                    { ":A": 1, "X": "A", ":B": "C", "Y": 1, "Z": "B" });
                assert.deepEqual(
                    { ":A": 1, ":B": "C" }, args.placeholders);
            });
        });
    });
});