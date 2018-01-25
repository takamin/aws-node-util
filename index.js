var awsNodeUtil = require("./lib/awscli.js");
awsNodeUtil.dynamodb = require("./lib/aws-dynamodb.js");
awsNodeUtil.dynamodb.ResultSet = require("./lib/dynamodb-result-set");
module.exports = awsNodeUtil;
