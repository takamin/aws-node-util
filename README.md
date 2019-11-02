AWS-Node-Util
=============

[![Build Status](https://travis-ci.org/takamin/aws-node-util.svg?branch=master)](https://travis-ci.org/takamin/aws-node-util)

DESCRIPTION
-----------

This module provides __SQL-ish statement classes to manipulate DynamoDB__.

[Query API parameter generator](./dynamodb-query-param.html) - 
A query parameter converter
that automatically yields placeholders of attribute name and value is available.

The latest [API reference](https://takamin.github.io/aws-node-util/apis/index.html) is available.

Statement classes:

1. ScanStatement
2. QueryStatement
3. PutItemStatement `(*1)`
4. DeleteItemStatement `(*1)`

`(*1)` - Currently, These cannot be parameterized. So the prepared execution is unavailable.

And also provides CLI commands that manipulate AWS services.
Some of these are depending on AWS CLI or shell script.

SQL-ish feature
---------------

See the sample code below to use the SQL-ish classes.

### Sample of SQL-ish statements

__sample/sqlish-sample.js__

To run this sample, a DynamoDB table named 'stars' is required.

On that table,
the attribute named 'mainStar' is a HASH-key typed as String and
'orbitOrder' is a RANGE-key typed as number.


```javascript
"use strict";
const awsNodeUtil = require("aws-node-util");
const ScanStatement = awsNodeUtil.dynamodb.ScanStatement;
const QueryStatement = awsNodeUtil.dynamodb.QueryStatement;
const ResultSet = awsNodeUtil.dynamodb.ResultSet;

// Connect (change each value for your account)
awsNodeUtil.connect(
//    { accessKeyId: 'AKID', secretAccessKey: 'SECRET', region: 'us-west-2' }
);

// Prepare a scanning-all-statement without parameters.
var scanAllStatement = new ScanStatement("FROM stars");

// Prepare 'Scan' statement to filter by name.
// The name is parameterized.
var scanByNameStatement = new ScanStatement(
        "FROM stars WHERE name=:name");

// Prepare 'Query' statement to get children of specific main star.
// The name of a main star is parameterized.
var queryChildrenStatement = new QueryStatement(
        "SELECT mainStar, orbitOrder, name " +
        "FROM stars " +
        "WHERE mainStar=:mainStar");

// Set DynamoDB API interface to each statementa
const dynamodbApi = awsNodeUtil.getService("DynamoDB");
scanAllStatement.dynamodb = dynamodbApi;
scanByNameStatement.dynamodb = dynamodbApi;
queryChildrenStatement.dynamodb = dynamodbApi;

// Run the statements
scanAllStatement.run({}, (err, resp) => {
    console.log("-----------------------");
    console.log("SCAN all items of stars");
    console.log("-----------------------");
    printResult(err, resp);
    scanByNameStatement.run({ ":name": "EARTH" }, (err, resp) => {
        console.log("--------------");
        console.log("SCAN the EARTH");
        console.log("--------------");
        printResult(err, resp);

        queryChildrenStatement.run({ ":mainStar": "EARTH" }, (err, resp) => {
            console.log("------------------------------");
            console.log("QUERY child stars of the EARTH");
            console.log("------------------------------");
            printResult(err, resp);
        });
    });
});

// Handler to print result of scan / query
function printResult(err, result) {
    if(err) {
        console.error("Error:", err.stack);
    } else {
        ResultSet.printScanResult(result);
    }
}
```

__outputs__

```bash
$ node sample/sqlish-sample.js
-----------------------
SCAN all items of stars
-----------------------
Count: 10
ROWNUM diameter rotation role      mass      gravity density escapeVelocity name    orbitOrder mainStar
     1     3475    655.7 satellite    0.0073     1.6    3340            2.4 MOON             1 EARTH
     2     4879   1407.6 planet       0.33       3.7    5427            4.3 MERCURY          1 SUN
     3    12104  -5832.0 planet       4.87       8.9    5243           10.4 VENUS            2 SUN
     4    12756     23.9 planet       5.97       9.8    5514           11.2 EARTH            3 SUN
     5     6792     24.6 planet       0.642      3.7    3933            5.0 MARS             4 SUN
     6   142984      9.9 planet    1898.0       23.1    1326           59.5 JUPITER          5 SUN
     7   120536     10.7 planet     568.0        9.0     687           35.5 SATURN           6 SUN
     8    51118    -17.2 planet      86.8        8.7    1271           21.3 URANUS           7 SUN
     9    49528     16.1 planet     102.0       11.0    1638           23.5 NEPTUNE          8 SUN
    10     2370   -153.3 planet       0.0146     0.7    2095            1.3 PLUTO            9 SUN
ScannedCount: 10
--------------
SCAN the EARTH
--------------
Count: 10
ROWNUM diameter rotation role   mass gravity density escapeVelocity name  orbitOrder mainStar
     1    12756     23.9 planet 5.97     9.8    5514           11.2 EARTH          3 SUN
ScannedCount: 10
------------------------------
QUERY child stars of the EARTH
------------------------------
Count: 1
ROWNUM name orbitOrder mainStar
     1 MOON          1 EARTH
ScannedCount: 1

```

Scan / QueryStatement run and next method
-----------------------------------------

If the `LIMIT` feature is used for the Scan or QueryStatement,
In the callback specified for `run()` method,
the `next()` method is available to get followed items.

Here is sample codes.

__sample/scan-next-sample.js__

```JavaScript
"use strict";
const awsNodeUtil = require("aws-node-util");
const ScanStatement = awsNodeUtil.dynamodb.ScanStatement;
const ResultSet = awsNodeUtil.dynamodb.ResultSet;

// Connect (change each value for your account)
awsNodeUtil.connect(
//    { accessKeyId: 'AKID', secretAccessKey: 'SECRET', region: 'us-west-2' }
);

// Prepare 'Scan' statement
var scanStatement = new ScanStatement(
        "FROM stars LIMIT 3");
scanStatement.dynamodb = awsNodeUtil.getService("DynamoDB");

scanStatement.run({}, (err, data) => {
    if(err) {
        console.error("Error: ", err.message);
    } else if(data) {
        ResultSet.printScanResult(data);
        scanStatement.next();
    } else if(data == null) {
        console.error("OK");
    }
});
```

__output__

```sh
$ node sample/scan-next-sample.js
Count: 3
ROWNUM diameter rotation role      mass   gravity density escapeVelocity name    orbitOrder mainStar
     1     3475    655.7 satellite 0.0073     1.6    3340            2.4 MOON             1 EARTH
     2     4879   1407.6 planet    0.33       3.7    5427            4.3 MERCURY          1 SUN
     3    12104  -5832.0 planet    4.87       8.9    5243           10.4 VENUS            2 SUN
LastEvaluatedKey: {"orbitOrder":{"N":"2"},"mainStar":{"S":"SUN"}}
ScannedCount: 3
Count: 3
ROWNUM diameter rotation role   mass     gravity density escapeVelocity name    orbitOrder mainStar
     1    12756     23.9 planet    5.97      9.8    5514           11.2 EARTH            3 SUN
     2     6792     24.6 planet    0.642     3.7    3933            5.0 MARS             4 SUN
     3   142984      9.9 planet 1898.0      23.1    1326           59.5 JUPITER          5 SUN
LastEvaluatedKey: {"orbitOrder":{"N":"5"},"mainStar":{"S":"SUN"}}
ScannedCount: 3
Count: 3
ROWNUM diameter rotation role   mass  gravity density escapeVelocity name    orbitOrder mainStar
     1   120536     10.7 planet 568.0     9.0     687           35.5 SATURN           6 SUN
     2    51118    -17.2 planet  86.8     8.7    1271           21.3 URANUS           7 SUN
     3    49528     16.1 planet 102.0    11.0    1638           23.5 NEPTUNE          8 SUN
LastEvaluatedKey: {"orbitOrder":{"N":"8"},"mainStar":{"S":"SUN"}}
ScannedCount: 3
Count: 1
ROWNUM diameter rotation role   mass   gravity density escapeVelocity name  orbitOrder mainStar
     1     2370   -153.3 planet 0.0146     0.7    2095            1.3 PLUTO          9 SUN
ScannedCount: 1
OK
```

__sample/query-next-sample.js__

```JavaScript
"use strict";
const awsNodeUtil = require("aws-node-util");
const QueryStatement = awsNodeUtil.dynamodb.QueryStatement;
const ResultSet = awsNodeUtil.dynamodb.ResultSet;

// Connect (change each value for your account)
awsNodeUtil.connect(
//    { accessKeyId: 'AKID', secretAccessKey: 'SECRET', region: 'us-west-2' }
);

// Prepare 'Query' statement
var queryStatement = new QueryStatement(
        "FROM stars WHERE mainStar=:ms LIMIT 2");
queryStatement.dynamodb = awsNodeUtil.getService("DynamoDB");

queryStatement.run({":ms": "SUN" }, (err, data) => {
    if(err) {
        console.error("Error: ", err.message);
    } else if(data) {
        ResultSet.printScanResult(data);
        queryStatement.next();
    } else if(data == null) {
        console.error("OK");
    }
});
```

__output__

```sh
$ node sample/query-next-sample.js
Count: 2
ROWNUM diameter rotation role   mass gravity density escapeVelocity name    orbitOrder mainStar
     1     4879   1407.6 planet 0.33     3.7    5427            4.3 MERCURY          1 SUN
     2    12104  -5832.0 planet 4.87     8.9    5243           10.4 VENUS            2 SUN
LastEvaluatedKey: {"orbitOrder":{"N":"2"},"mainStar":{"S":"SUN"}}
ScannedCount: 2
Count: 2
ROWNUM diameter rotation role   mass  gravity density escapeVelocity name orbitOrder mainStar
     1    12756     23.9 planet 5.97      9.8    5514           11.2 EARTH         3 SUN
     2     6792     24.6 planet 0.642     3.7    3933            5.0 MARS          4 SUN
LastEvaluatedKey: {"orbitOrder":{"N":"4"},"mainStar":{"S":"SUN"}}
ScannedCount: 2
Count: 2
ROWNUM diameter rotation role   mass gravity density escapeVelocity name    orbitOrder mainStar
     1   142984      9.9 planet 1898    23.1    1326           59.5 JUPITER          5 SUN
     2   120536     10.7 planet  568     9.0     687           35.5 SATURN           6 SUN
LastEvaluatedKey: {"orbitOrder":{"N":"6"},"mainStar":{"S":"SUN"}}
ScannedCount: 2
Count: 2
ROWNUM diameter rotation role   mass  gravity density escapeVelocity name    orbitOrder mainStar
     1    51118    -17.2 planet  86.8     8.7    1271           21.3 URANUS           7 SUN
     2    49528     16.1 planet 102.0    11.0    1638           23.5 NEPTUNE          8 SUN
LastEvaluatedKey: {"orbitOrder":{"N":"8"},"mainStar":{"S":"SUN"}}
ScannedCount: 2
Count: 1
ROWNUM diameter rotation role   mass   gravity density escapeVelocity name  orbitOrder mainStar
     1     2370   -153.3 planet 0.0146     0.7    2095            1.3 PLUTO          9 SUN
ScannedCount: 1
OK
```

__sample/put-and-delete-item.js__

```javascript
"use strict";
const awsNodeUtil = require("aws-node-util");
const QueryStatement = awsNodeUtil.dynamodb.QueryStatement;
const PutItemStatement = awsNodeUtil.dynamodb.PutItemStatement;
const DeleteItemStatement = awsNodeUtil.dynamodb.DeleteItemStatement;
const ResultSet = awsNodeUtil.dynamodb.ResultSet;

// Connect (change each value for your account)
awsNodeUtil.connect(
//    { accessKeyId: 'AKID', secretAccessKey: 'SECRET', region: 'us-west-2' }
);
const dynamodbApi = awsNodeUtil.getService("DynamoDB");

// Handler to print result of scan / query
function printResult(result) {
    ResultSet.printScanResult(result);
}

// Prepare 'PutItem' statement
var putItemStatement = new PutItemStatement(
    ["INSERT INTO stars (",
        "mainStar, role, orbitOrder, name",
    ") VALUES (",
        "'SUN', 'planet', 10, 'X'",
    ")"].join(" "));
putItemStatement.dynamodb = dynamodbApi;

// Add planet X
putStar(putItemStatement, {}).then( () => {

    // Add planet Y
    putItemStatement.setValues([
        "SUN", "planet", 25, "Y"
    ]);
    return putStar( putItemStatement, {});

}).then( () => {

    // Add planet Z
    return putStar( putItemStatement, {
        orbitOrder:35, name:"Z"
    });// mainStar and role is not changed from previous.

}).then( () => {
    return queryStar("mainStar, orbitOrder, name, role", "mainStar = 'SUN'");
}).then(resp => {
    console.log("----------------------------");
    console.log("QUERY child stars of the SUN");
    console.log("----------------------------");
    printResult(resp);
}).then( () => {

    //Delete planets named X, Y and Z.
    return deleteWhere( "mainStar = 'SUN' AND orbitOrder >= 10" );

}).then( () => {
    return queryStar("mainStar, orbitOrder, name, role", "mainStar = 'SUN'");
}).then(resp => {
    console.log("----------------------------");
    console.log("QUERY child stars of the SUN");
    console.log("----------------------------");
    printResult(resp);
}).catch( err => {
    console.error("Error:", err.stack);
});

function deleteWhere(condition) {
    return queryStar( "mainStar, orbitOrder", condition ).then(result => {
        let resultSet = new ResultSet(result);
        return Promise.all(resultSet.getItems().map(item => {
            return deleteStar([
                "mainStar = '" + item.mainStar + "'",
                "AND orbitOrder = " + item.orbitOrder
            ].join(" "));
        }));
    });
}

function putStar(statement, args) {
    return new Promise( (resolve, reject) => {
        statement.run(args, err => {
            if(err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function queryStar(select, condition) {
    return new Promise( (resolve, reject) => {
        const statement = new QueryStatement([
            "SELECT", select, "FROM stars",
            "WHERE", condition
        ].join(" "));
        statement.dynamodb = dynamodbApi;
        statement.run({}, (err, result) => {
            if(err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function deleteStar(condition) {
    return new Promise( (resolve, reject) => {
        console.log("DELETE", condition);
        const statement = new DeleteItemStatement([
            "DELETE FROM stars WHERE",
            condition
        ].join(" "));
        statement.dynamodb = dynamodbApi;
        statement.run({}, (err) => {
            if(err) {
                reject(err);
            } else {
                resolve();
            }
        })
    });
}
```

__outputs__

```sh
$ node sample/put-and-delete-item.js
----------------------------
QUERY child stars of the SUN
----------------------------
Count: 12
ROWNUM role   name    orbitOrder mainStar
     1 planet MERCURY          1 SUN
     2 planet VENUS            2 SUN
     3 planet EARTH            3 SUN
     4 planet MARS             4 SUN
     5 planet JUPITER          5 SUN
     6 planet SATURN           6 SUN
     7 planet URANUS           7 SUN
     8 planet NEPTUNE          8 SUN
     9 planet PLUTO            9 SUN
    10 planet X               10 SUN
    11 planet Y               25 SUN
    12 planet Z               35 SUN
ScannedCount: 12
DELETE mainStar = 'SUN' AND orbitOrder = 10
DELETE mainStar = 'SUN' AND orbitOrder = 25
DELETE mainStar = 'SUN' AND orbitOrder = 35
----------------------------
QUERY child stars of the SUN
----------------------------
Count: 9
ROWNUM role   name    orbitOrder mainStar
     1 planet MERCURY          1 SUN
     2 planet VENUS            2 SUN
     3 planet EARTH            3 SUN
     4 planet MARS             4 SUN
     5 planet JUPITER          5 SUN
     6 planet SATURN           6 SUN
     7 planet URANUS           7 SUN
     8 planet NEPTUNE          8 SUN
     9 planet PLUTO            9 SUN
ScannedCount: 9

```

CLI-Commands for Amazon Dynamo
------------------------------

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

```bash
Usage:
1) aws-dynamodb-query [OPTIONS] <tableName> <keyConditionExpression>
2) aws-dynamodb-query [OPTIONS] -q <SQL-ish-statement>

  -c, --max-items=ARG                 The total number of items to return
  -n, --starting-token=ARG            A token to specify where to start
                                      paginating
  -s, --sort-item=ARG                 JSON path to the sort item
  -p, --projection-expression=ARG     comma separated attribute names to
                                      project
  -k, --key-condition-expression=ARG  key condition expression of query
  -f, --filter-expression=ARG         filter expression applied after
                                      query
  -d, --desc                          Sorting direction to descendent
  -j, --output-json                   output a json to read
  -J, --output-json-oneline           output a json in oneline
  -t, --dry-run                       Print options of the query and exit
  -q, --sql-ish                       Query by SQL-ish-statement(beta)
  -h, --help                          display this help

PARAMETERS:

  tableName              The table name defined in DynamoDB.
  keyConditionExpression KeyConditionExpression for the DynamoDB table.
  SQL-ish-statement      SQL-ish text that represents a query

  1) In all expression parameter, option value or SQL-ish,the field names
  could be represented as is for its declared name in the table without
  considering the placeh older of AWS DynamoDB.

  2) Here is an examples showing a syntax for SQL-ish-statement of query.

    [ SELECT <projection-expression> ]
    FROM <tableName>
    WHERE <keyConditionExpression>
    [ FILTER <filter-expression> ]
    [ LIMIT <max-items> ]

  This says the FROM and WHERE clauses are mandatory and the SELECT,
  FILTER and LIMIT are optional.

```

__EXAMPLE__

```bash
$ aws-dynamodb-query stars \
> "mainStar='SUN' AND orbitOrder BETWEEN 1 AND 9" \
> --projection-expression "name, mass, diameter" \
> --sort-item orbitOrder
Count: 9
ROWNUM diameter mass      name
     1     4879    0.33   MERCURY
     2    12104    4.87   VENUS
     3    12756    5.97   EARTH
     4     6792    0.642  MARS
     5   142984 1898.0    JUPITER
     6   120536  568.0    SATURN
     7    51118   86.8    URANUS
     8    49528  102.0    NEPTUNE
     9     2370    0.0146 PLUTO
ScannedCount: 9
```

SQL-ish statement:

```bash
$ aws-dynamodb-query -q "SELECT name, mass, diameter \
> FROM stars \
> WHERE mainStar='SUN' AND orbitOrder BETWEEN 1 AND 9" \
> --sort-item orbitOrder
Count: 9
ROWNUM diameter mass      name
     1     4879    0.33   MERCURY
     2    12104    4.87   VENUS
     3    12756    5.97   EARTH
     4     6792    0.642  MARS
     5   142984 1898.0    JUPITER
     6   120536  568.0    SATURN
     7    51118   86.8    URANUS
     8    49528  102.0    NEPTUNE
     9     2370    0.0146 PLUTO
ScannedCount: 9
```

### 4. aws-dynamodb-scan

```bash
Usage:
1) aws-dynamodb-scan [OPTIONS] <tableName>
2) aws-dynamodb-scan [OPTIONS] -q <SQL-ish-statement>

  -c, --max-items=ARG              The total number of items to return
  -n, --starting-token=ARG         A token to specify where to start
                                   paginating
  -s, --sort-item=ARG              JSON path to the sort item
  -p, --projection-expression=ARG  comma separated attribute names to
                                   project
  -f, --filter-expression=ARG      filter expression
  -d, --desc                       Sorting direction to descendent
  -j, --output-json                output a json to read
  -J, --output-json-oneline        output a json in oneline
  -t, --dry-run                    Print options of the scan and exit
  -q, --sql-ish                    Query by SQL-ish-statement(beta)
  -h, --help                       display this help

PARAMETERS:

  tableName              The table name defined in DynamoDB.
  SQL-ish-statement      SQL-ish text that represents a scan

  1) In all expression parameter, option value or SQL-ish,the field names
  could be represented as is for its declared name in the table without
  considering the placeh older of AWS DynamoDB.

  2) Here is an examples showing a syntax for SQL-ish-statement of scan.

    [ SELECT <projection-expression> ]
    FROM <tableName>
    [ WHERE <filter-expression> ]
    [ LIMIT <max-items> ]

  This says the FROM clauses is mandatory and the SELECT, WHERE and LIMIT
  are optional.
```

__EXAMPLE__

Comamnd line:

```bash

$ aws-dynamodb-scan stars
Count: 10
ROWNUM diameter rotation role      mass      gravity density escapeVelocity name    orbitOrder mainStar
     1     3475    655.7 satellite    0.0073     1.6    3340            2.4 MOON             1 EARTH
     2     4879   1407.6 planet       0.33       3.7    5427            4.3 MERCURY          1 SUN
     3    12104  -5832.0 planet       4.87       8.9    5243           10.4 VENUS            2 SUN
     4    12756     23.9 planet       5.97       9.8    5514           11.2 EARTH            3 SUN
     5     6792     24.6 planet       0.642      3.7    3933            5.0 MARS             4 SUN
     6   142984      9.9 planet    1898.0       23.1    1326           59.5 JUPITER          5 SUN
     7   120536     10.7 planet     568.0        9.0     687           35.5 SATURN           6 SUN
     8    51118    -17.2 planet      86.8        8.7    1271           21.3 URANUS           7 SUN
     9    49528     16.1 planet     102.0       11.0    1638           23.5 NEPTUNE          8 SUN
    10     2370   -153.3 planet       0.0146     0.7    2095            1.3 PLUTO            9 SUN
ScannedCount: 10

```

SQL-ish statement:

```bash

$ aws-dynamodb-scan -q "FROM stars"
Count: 10
ROWNUM diameter rotation role      mass      gravity density escapeVelocity name    orbitOrder mainStar
     1     3475    655.7 satellite    0.0073     1.6    3340            2.4 MOON             1 EARTH
     2     4879   1407.6 planet       0.33       3.7    5427            4.3 MERCURY          1 SUN
     3    12104  -5832.0 planet       4.87       8.9    5243           10.4 VENUS            2 SUN
     4    12756     23.9 planet       5.97       9.8    5514           11.2 EARTH            3 SUN
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

CLI-commands for AWS Lambda
---------------------------

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

CLI-commands for AWS IoT
------------------------

1. __aws-iot-list-all-resources__ - list all the IoT resouces
2. __aws-iot-create-keys-and-certificate__ - create certificate and attach the thing and/or policy
3. __aws-iot-create-policy__ - create a policy
4. __aws-iot-create-thing__ - create a thing
5. __aws-iot-delete-thing__ - delete the thing
6. __aws-iot-describe-thing__ - describe the thing
7. __aws-iot-get-policy__ - print the policy


CLI-commands for AWS API Gateway
--------------------------------

1. __aws-apigw-describe-api__ - describe an api content to json. it includes all the resources and all the methods.
2. __aws-apigw-create-rest-api__
3. __aws-apigw-create-resource__
4. __aws-apigw-list-resources__

CLI-commands for AWS IAM
------------------------

1. __aws-iam-list-roles__ - list names and created date of all the role
2. __aws-iam-get-role__ - print role's JSON document to stdout
3. __aws-iam-create-role__ - create role by the name and a JSON file that describes an assume-role-policy-document
4. __aws-iam-attach-role-policy__ - attach a policy represented by arn to the role

LICENSE
-------

This software is released under the MIT License, see [LICENSE](LICENSE)
