var fs = require('fs');
var AwsLambda = {};
AwsLambda.echoZipLoc = function(filename) {
    fs.readFile(filename, function(err, data) {
        if(err) { throw err; }
        var desc = JSON.parse(data);
        console.log(desc.Code.Location);
    });
};
module.exports = AwsLambda;
