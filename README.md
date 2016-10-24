AWS-Node-Util
=============

DESCRIPTION
-----------

The command sets to manipulate AWS with the local command line interface.

These are wrapper for the AWS CLI with shell script or Node.js.
So, this command set needs AWS CLI and Node.js.

Utils for Amazon Dynamo
-----------------------

1. __aws-dynamodb-delete-item__ - delete item on the table
1. __aws-dynamodb-put-item__ - put item to the table
1. __aws-dynamodb-query__ - query and display items in the table
1. __aws-dynamodb-scan__ - scan and display items in the table
1. __aws-dynamodb-create-table__ - create table with a json file. the file desc2create output can use.
1. __aws-dynamodb-delete-table__ - delete the table
1. __aws-dynamodb-desc2create__ - Convert a JSON to create the table from its description
1. __aws-dynamodb-describe-table__ - describe the table
1. __aws-dynamodb-list-tables__ - display the table names

These commands are designed to recognize the keywords
in the expressions and to generate placeholders automatically.

### 1. aws-dynamodb-delete-item

Delete -- delete the item from the table.

```bash
$ aws-dynamodb-delete-item `<table-name>` `<item-expression>`
```

__Parameters__

|Parameter          |Content                         |
|:------------------|:-------------------------------|
| table-name        | Target table name              |
| key               | Item to delete from the table  |

* __key__ is a comma separated string representing
key attribute names and values
like `<attr-name1> = <value>, <attr-name2> = <value>, ...`.
* All the keys must be included
* The value type will be determined automatically from its notation.

### 2. aws-dynamodb-put-item

Put -- insert or update the item to the table from command line.

```bash
$ aws-dynamodb-put-item `<table-name>` `<item-expression>` ...
```

__Parameters__

|Parameter          |Content                     |
|:------------------|:---------------------------|
| table-name        | Target table name          |
| item-expression   | Items to put to the table  |

* __item-expression__ is comma separated strings representing
attribute names and values
like `<attr-name1> = <value>, <attr-name2> = <value>, ...`.
* All the keys must be included to specify whether the items
will be inserted or updated.
* The attribute name can be `path.to.the.item` (See the example below).
* The value type will be determined automatically from its notation.

__Example__

Comamnd line:

```bash
$ aws-dynamodb-put-item testTable '
    id="123",
    timestamp=145678900,
    test.name="foo",
    test.pass=true,
    value.version="0.6.6"
'
```

Then Item to be added to the table:

```javascript
{
    "id":       {"S": "123"},
    "timestamp":{"N": "145678900"},
    "test": {
        "M": {
            "name": {"S": "foo"},
            "pass": {"BOOL": true}
        }
    },
    "value" : {"M" : {"version": {"S": "0.6.6"}}}
}
```

__Available Types Assumed In Automatic__

| value        | type       |
|:------------:|:-----------|
| true / false | boolean    |
| "ABC" / '123'| string     |
| 123.4        | number     |


### 3. aws-dynamodb-query

Query -- This reports the retrieved data that matches key-conditions given
from command-line without consideration about the placeholder.

__$ aws-dynamodb-query `<table-name>` `<key-condition-expression>` `[options]`__

* `table-name` - target table name
* `key-condition-expression` - query condition about key of the table.

__OPTIONS__

* --filter-expression / --key-condition-expression

The conditional expression for the query.

* --projection-expression

Specify a comma separated attribute names to retrieve specific attributes.

__EXAMPLE__

Comamnd line:

```bash

$ aws-dynamodb-query stars \
> "mainStar='SUN' AND orbitOrder BETWEEN 1 AND 9" \
> --projection-expression "name, mass, diameter" \
> --sort-item orbitOrder
Count: 9
ROWNUM diameter mass      name
     1     4879    0.33   MERCURY
     2    12104    4.87   VENUS
     3    12756    5.97   MARS
     4     6792    0.642  MARS
     5   142984 1898.0    JUPITER
     6   120536  568.0    SATURN
     7    51118   86.8    URANUS
     8    49528  102.0    NEPTUNE
     9     2370    0.0146 PLUTO
ScannedCount: 9

```

### 4. aws-dynamodb-scan

__$ aws-dynamodb-scan `<table-name>` `[options]`__

* `table-name` - target table name

__OPTIONS__

* --filter-expression

The conditional expression for the query.

* --projection-expression

Specify a comma separated attribute names to retrieve specific attributes.

__EXAMPLE__

Comamnd line:

```bash

$ aws-dynamodb-scan stars
Count: 10
ROWNUM diameter rotation role      mass      gravity density escapeVelocity name    orbitOrder mainStar
     1     3475    655.7 satellite    0.0073     1.6    3340            2.4 MOON             1 EARTH
     2     4879   1407.6 planet       0.33       3.7    5427            4.3 MERCURY          1 SUN
     3    12104  -5832.0 planet       4.87       8.9    5243           10.4 VENUS            2 SUN
     4    12756     23.9 planet       5.97       9.8    5514           11.2 MARS             3 SUN
     5     6792     24.6 planet       0.642      3.7    3933            5.0 MARS             4 SUN
     6   142984      9.9 planet    1898.0       23.1    1326           59.5 JUPITER          5 SUN
     7   120536     10.7 planet     568.0        9.0     687           35.5 SATURN           6 SUN
     8    51118    -17.2 planet      86.8        8.7    1271           21.3 URANUS           7 SUN
     9    49528     16.1 planet     102.0       11.0    1638           23.5 NEPTUNE          8 SUN
    10     2370   -153.3 planet       0.0146     0.7    2095            1.3 PLUTO            9 SUN
ScannedCount: 10

```

### Don't Worry The Placeholders

For the expressions of dynamodb query and scan commands,
You can write the attribute names or its values directly.
Because,
__the placeholders are recognized and created in automatic__ by the commands
So, you don't need to worry about it.

----

Utils for AWS Lambda
-------------------

1. __aws-lambda-get__ - Download a lambda function
2. __aws-lambda-upload__ - Upload the function code
3. __aws-lambda-create__ - Create and upload the function code

Following utilities are required to download and extract a ZIP on aws-lambda-get / upload.

* Curl
* Zip/Unzip

### 1. __aws-lambda-get__ - Download a lambda function

```
$ aws-lambda-get <function-name>
```

* A Zip file is downloaded from AWS Lambda and extracted to a sub directory named same to the function.

### 2. __aws-lambda-upload__ - Upload the function code

Update the function to upload a zip file which is created in automatic
and contains all the files in subdirectory of the same name as the
function.

```
$ aws-lambda-upload <sub-directory-name>
```

* Note: this cannot create a new function.

### 3. __aws-lambda-create__ - Create and upload the function code

Create the function to upload a zip file which is created in automatic
and contains all the files in subdirectory of the same name as the
function.

```
$ aws-lambda-create <sub-directory-name> <role-arn>
```

----

Utils for AWS IoT
-----------------

1. __aws-iot-list-all-resources__ - list all the IoT resouces
2. __aws-iot-create-keys-and-certificate__ - create certificate and attach the thing and/or policy
3. __aws-iot-create-policy__ - create a policy
4. __aws-iot-create-thing__ - create a thing
5. __aws-iot-delete-thing__ - delete the thing
6. __aws-iot-describe-thing__ - describe the thing
7. __aws-iot-get-policy__ - print the policy


Utils for AWS API Gateway
-------------------------

1. __aws-apigw-describe-api__ - describe an api content to json. it includes all the resources and all the methods.
2. __aws-apigw-create-rest-api__
3. __aws-apigw-create-resource__
4. __aws-apigw-list-resources__

Utils for AWS IAM
-----------------

1. __aws-iam-list-roles__ - list names and created date of all the role
2. __aws-iam-get-role__ - print role's JSON document to stdout
3. __aws-iam-create-role__ - create role by the name and a JSON file that describes an assume-role-policy-document
4. __aws-iam-attach-role-policy__ - attach a policy represented by arn to the role

LICENSE
-------

This software is released under the MIT License, see [LICENSE](LICENSE)
