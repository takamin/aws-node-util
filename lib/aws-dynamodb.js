(function() {
    var fs = require('fs');
    var awscli = require("../lib/awscli");
    var listit = require('list-it');
    awscli.dynamodb = awscli.dynamodb || {};
    awscli.dynamodb.putCreateTableJson = function(filename) {
        fs.readFile(filename, function(err, data) {
            if(err) {
                console.error("ERROR:", err);
                return;
            }
            var desc = JSON.parse(data);
            awscli.dynamodb.convertJsonTableDescToCreate(desc, function(err, data){
                if(err) {
                    console.error("ERROR:", err);
                    return;
                }
                console.log(JSON.stringify(data, null, "    "));
            });
        });
    };
    awscli.dynamodb.convertJsonTableDescToCreate = function(desc, callback) {
        var create = desc.Table;
        if(create.GlobalSecondaryIndexes) {
            for(var i = 0; i < create.GlobalSecondaryIndexes.length; i++) {
                delete create.GlobalSecondaryIndexes[i].IndexSizeBytes;
                delete create.GlobalSecondaryIndexes[i].ProvisionedThroughput.NumberOfDecreasesToday;
                delete create.GlobalSecondaryIndexes[i].IndexStatus;
                delete create.GlobalSecondaryIndexes[i].IndexArn;
                delete create.GlobalSecondaryIndexes[i].ItemCount;
            }
        }
        delete create.TableArn;
        delete create.ProvisionedThroughput.NumberOfDecreasesToday;
        delete create.TableSizeBytes;
        delete create.TableStatus;
        delete create.LatestStreamLabel;
        delete create.ItemCount;
        delete create.CreationDateTime;
        delete create.LatestStreamArn;
        callback(null, create);
    };
    awscli.dynamodb.map2model = function(map) {
        var dataModel = {};
        Object.keys(map).forEach(function(key) {
            Object.keys(map[key]).forEach(function(type) {
                var value = map[key][type];
                switch(type) {
                case "S":
                    dataModel[key] = value;
                    break;
                case "N":
                    dataModel[key] = parseInt(value);
                    break;
                case "BOOL":
                    dataModel[key] = value;
                    break;
                case "M":
                    dataModel[key] = awscli.dynamodb.map2model(value);
                    break;
                }
            });
        });
        return dataModel;
    };
    awscli.dynamodb.refAttrByPath = function(obj, path) {
        var dataitem = obj;
        var paths = path.split('.');
        for(var i = 0; i < paths.length; i++) {
            var pathElement = paths[i];
            if(typeof(dataitem) != "object"
                    || !(pathElement in dataitem))
            {
                return null;
            }
            dataitem = dataitem[pathElement];
            var types = Object.keys(dataitem);
            if(types.length > 0) {
                var type = types[0];
                dataitem = dataitem[type];
                switch(type) {
                case 'N':
                    if(dataitem.match(/\./)) {
                        dataitem = parseFloat(dataitem);
                    } else {
                        dataitem = parseInt(dataitem);
                    }
                    break;
                case "BOOL":
                    dataitem = (dataitem == true);
                    break;
                }
            }
        }
        return dataitem;
    };

    //
    // Print scan result to console
    //
    awscli.dynamodb.printScanResult = function(data, sortItemPath, sortDesc) {
        var colNames = awscli.dynamodb.getAllScannedAttributeNames(data.Items);
        var rows = awscli.dynamodb.convertItemsTo2dArray(data, colNames);
        rows = awscli.dynamodb.sortRowsByColumnPath(
            rows, colNames, sortItemPath, sortDesc);

        if("Count" in data) {
            console.log("Count:", data.ScannedCount);
        }

        // format table
        var buf = listit.buffer({ "autoAlign": true });
        var rownum = 0;
        buf.d("ROWNUM");
        buf.d(colNames);
        rows.forEach(function(row) {
            buf.d(++rownum);
            buf.d(row);
        });
        console.log(buf.toString());
        if("NextToken" in data) {
            console.log("NextToken:", data.NextToken);
        }
        if("ScannedCount" in data) {
            console.log("ScannedCount:", data.ScannedCount);
        }
    };
    awscli.dynamodb.getAllScannedAttributeNames = function(items) {
        var colNames = [];
        var traverseKeys = function(item, namePath) {
            namePath = namePath || [];
            Object.keys(item).forEach(function(key) {
                namePath.push(key);
                var attrName = namePath.join('.');
                var type = null;
                var types = Object.keys(item[key]);
                if(types.length > 0) {
                    type = types[0];
                }
                if(type == 'M') {
                    traverseKeys(item[key]['M'], namePath);
                } else {
                    if(colNames.indexOf(attrName) < 0) {
                        colNames.push(attrName);
                    }
                }
                namePath.pop();
            });
        };

        // Traverse column names
        items.forEach(function(item) {
            traverseKeys(item);
        });

        return colNames;
    };

    //
    // Convert scan/query result to 2-D array
    //
    awscli.dynamodb.convertItemsTo2dArray = function(data, colNames) {
        var rows = [];
        data.Items.forEach(function(item) {
            var cols = [];
            colNames.forEach(function(pathItem) {
                var value = awscli.dynamodb.refAttrByPath(item, pathItem);
                if(value == null) {
                    value = "";
                }
                cols.push(value);
            });
            rows.push(cols);
        });
        return rows;
    };

    awscli.dynamodb.sortRowsByColumnPath = function(
            rows, colNames, sortItemPath, sortDesc)
    {
        // Sorting
        if(sortItemPath) {
            var col = colNames.indexOf(sortItemPath);
            if(col >= 0) {
                for(var i0 = 0; i0 < rows.length; i0++) {
                    for(var i1 = i0 + 1; i1 < rows.length; i1++) {
                        if(rows[i0][col] > rows[i1][col]) {
                            var tmp = rows[i0];
                            rows[i0] = rows[i1];
                            rows[i1] = tmp;
                        }
                    }
                }
            }
            if(sortDesc) {
                rows = rows.reverse();
            }
        }
        return rows;
    };

    var parsers = require("../lib/aws-dynamodb-expr-parsers");
    awscli.dynamodb.parseProjectionExpression = parsers.parseProjectionExpression;
    awscli.dynamodb.parseConditionExpression = parsers.parseConditionExpression;
    awscli.dynamodb.parseItemListToMap = parsers.parseItemListToMap;
    module.exports = awscli.dynamodb;
}());
