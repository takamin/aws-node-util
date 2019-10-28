var assert = require("chai").assert;
describe("aws-configure", function() {

    describe("#getAwsProfile", function() {

        var AwsConfigure = require("../lib/aws-configure");
        it("should return null, when environment variable 'AWS_PROFILE' does not exist", function() {
            delete process.env["AWS_PROFILE"];
            assert.equal( null, AwsConfigure.getAwsProfile());
        });

        it("should return the value of environment variable 'AWS_PROFILE', if it exists", function() {
            process.env["AWS_PROFILE"] = "profileA";
            assert.equal(
                process.env["AWS_PROFILE"],
                AwsConfigure.getAwsProfile());
            delete process.env["AWS_PROFILE"];
        });
    });

    describe("#getConfiguredRegion", function() {

        var AwsConfigure = require("../lib/aws-configure");
        var cfg = AwsConfigure.getConfig() || {};
        cfg["default"] = { output: "output-default", region: "test-region-default" };
        cfg["profile A"] = { output: "output-A", region: "test-region-A" };
        cfg["profile B"] = { output: "output-B", region: "test-region-B" };
        AwsConfigure.setConfig(cfg);

        it("should return a default region, when no profile was given", function() {
            assert.equal(
                "test-region-default",
                AwsConfigure.getConfiguredRegion());
        });

        it("should return a default region, when null was given as profile", function() {
            assert.equal(
                "test-region-default",
                AwsConfigure.getConfiguredRegion(null));
        });

        it("should return the region of the specific profile", function() {
            assert.equal(
                "test-region-A",
                AwsConfigure.getConfiguredRegion("A"));
        });

        it("should return null, when the profile does not exist", function() {
            assert.equal(
                null,
                AwsConfigure.getConfiguredRegion("C"));
        });

    });
});
