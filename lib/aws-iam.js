var awscli = require("./awscli");
awscli.iam = {};
awscli.iam.exec = function(command, opts, callback){
    awscli.exec('IAM', command, opts, callback);
};
awscli.iam.listRoles = function(callback) {
    awscli.iam.exec( 'list-roles', { }, callback);
};
awscli.iam.getRole = function(roleName, callback) {
    awscli.iam.exec(
            'get-role',
            {
                '--role-name': roleName
            },
            callback);
};
awscli.iam.createRole = function(roleName, assumeRolePolicyDocument, callback) {
    awscli.iam.exec(
            'create-role',
            {
                '--role-name': roleName,
                '--assume-role-policy-document':
                    JSON.stringify(assumeRolePolicyDocument)
            },
            callback);
};
awscli.iam.attachRolePolicy = function(roleName, policyArn, callback) {
    awscli.iam.exec(
            'attach-role-policy',
            {
                '--role-name': roleName,
                '--policy-arn': policyArn
            },
            callback);
};
module.exports = awscli.iam;
