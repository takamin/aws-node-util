AWS-Node-Util
=============

DESCRIPTION
-----------

The utilities to manipulate AWS Lambda and Amazon DynamoDB.

REQUIREMENT
-----------

For this utility, following utilities are required: AWS CLI, Curl, Zip/Unzip, and Node.js.

Utils for AWS Lambda
-------------------

1. __aws-lambda-get__ - Download a lambda function
2. __aws-lambda-upload__ - Upload the function code

### 1. __aws-lambda-get__ - Download a lambda function

```
$ aws-lambda-get <function-name>
```

* A Zip file is downloaded from AWS Lamnda and extracted to a sub directory named same to the function.

### 2. __aws-lambda-upload__ - Upload the function code

Update the function code to AWS Lambda.

```
$ aws-lambda-upload <sub-directory-name>
```

All the contents of the subdirectory is to be zipped and uploaded.

* Note: this cannot create a new function.


Utils for Amazon Dynamo
-----------------------

1. __aws-dynamodb-tbldesc2create__ - Get JSON to create the table from its description JSON
2. __aws-dynamodb-create-table__ - Create a table from specified JSON 
3. __aws-dynamodb-delete-table__ - Delete table by its name
