AWS-Node-Util
=============

DESCRIPTION
-----------

The command sets to manipulate AWS with the local command line interface.

These are wrapper for the AWS CLI with shell script or Node.js.

REQUIREMENT
-----------

For this utility, following utilities are required:

* AWS CLI
* Node.js
* Curl
* Zip/Unzip

Utils for AWS Lambda
-------------------

1. __aws-lambda-get__ - Download a lambda function
2. __aws-lambda-upload__ - Upload the function code
3. __aws-lambda-create__ - Create and upload the function code

### 1. __aws-lambda-get__ - Download a lambda function

```
$ aws-lambda-get <function-name>
```

* A Zip file is downloaded from AWS Lamnda and extracted to a sub directory named same to the function.

### 2. __aws-lambda-upload__ - Upload the function code

Update the function to upload a zip file which is created in automatic
and contains all the files in subdirectory of the same name as the
function.

```
$ aws-lambda-upload <sub-directory-name>
```

* Note: this cannot create a new function.

### 2. __aws-lambda-create__ - Create and upload the function code

Create the function to upload a zip file which is created in automatic
and contains all the files in subdirectory of the same name as the
function.

```
$ aws-lambda-create <sub-directory-name> <role-arn>
```

Utils for AWS API Gateway
-------------------------

1. __aws-apigw-describe-api__ - describe an api content to json. it includes all the resources and all the methods.
2. __aws-apigw-create-rest-api__
3. __aws-apigw-create-resource__
4. aws-apigw-list-resources

Utils for AWS IAM
-----------------

1. __aws-iam-list-roles__ - list names and created date of all the role
2. __aws-iam-get-role__ - print role's JSON document to stdout
3. __aws-iam-create-role__ - create role by the name and a JSON file that describes an assume-role-policy-document
4. __aws-iam-attach-role-policy__ - attach a policy represented by arn to the role

Utils for Amazon Dynamo
-----------------------

1. __aws-dynamodb-tbldesc2create__ - Get JSON to create the table from its description JSON
2. __aws-dynamodb-create-table__ - Create a table from specified JSON 
3. __aws-dynamodb-delete-table__ - Delete table by its name


LICENSE
-------

This software is released under the MIT License, see [LICENSE](LICENSE)