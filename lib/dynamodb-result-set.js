"use strict";
const DynamoDbDataModels = require("./dynamodb-data-models.js");
var listit = require('list-it');

/**
 * The result data model of DynamoDB SCAN or Query.
 *
 * @param {object} data The rensponse object from DynamoDB API SCAN and QUERY.
 *
 * @constructor
 */
function DynamoDbResultSet(data) {

    this._data = data;
    this._columns = getAllScannedAttributeNames(
            this._data.Items);
    this._rows = convertItemsTo2dArray(
            this._data.Items, this._columns);

}

DynamoDbResultSet.prototype.getRawItems = function() {
    return this._data.Items;
};

DynamoDbResultSet.prototype.getRawItemAt = function(rowIndex) {
    if(rowIndex >= this._data.Items.length) {
        throw new RangeError("rowIndex out of range: " + rowIndex);
    }
    return this._data.Items[rowIndex];
};

/**
 * Get an item converted to the native object from DynamoDB Map Data
 *
 * @returns {object[]} returns array of object converted.
 */
DynamoDbResultSet.prototype.getItems = function() {
    return this._data.Items.map( item => {
        return DynamoDbDataModels.map2obj(item);
    });
};

/**
 * Get an item converted to the native object from DynamoDB Map Data
 * by index of items.
 *
 * @param {integer} rowIndex
 * The index of item in Items.
 *
 * @returns {object} returns item converted to object.
 */
DynamoDbResultSet.prototype.getItemAt = function(rowIndex) {
    if(rowIndex >= this._data.Items.length) {
        throw new RangeError("rowIndex out of range: " + rowIndex);
    }
    return DynamoDbDataModels.map2obj(this._data.Items[rowIndex]);
};

/**
 * Print scan or query result to console.
 *
 * @param {string} sortItemPath
 * An attribute path name of item to sort.
 *
 * @param {boolean} sortDesc (Optional)
 * Specify true to sort items descent.
 *
 * @returns {undefined}
 */
DynamoDbResultSet.prototype.print = function(sortItemPath, sortDesc) {
    DynamoDbResultSet.printScanResult(this._data, sortItemPath, sortDesc);
};

/**
 * Print scan or query result to console.
 *
 * @param {object} data
 * The response object from DynamoDB API SCAN and QUERY.
 *
 * @param {string} sortItemPath
 * An attribute path name of item to sort.
 *
 * @param {boolean} sortDesc (Optional)
 * Specify true to sort items descent.
 *
 * @returns {undefined}
 */
DynamoDbResultSet.printScanResult = function(data, sortItemPath, sortDesc) {
    var colNames = getAllScannedAttributeNames(data.Items);
    var rows = convertItemsTo2dArray(data.Items, colNames);
    if(sortItemPath) {
        var colIndex = colNames.indexOf(sortItemPath);
        if(colIndex >= 0) {
            rows.sort( !sortDesc ? (a, b) => {
                if(a[colIndex] > b[colIndex]) { return 1; }
                if(a[colIndex] < b[colIndex]) { return -1; }
                return 0;
            } : (a, b) => {
                if(a[colIndex] > b[colIndex]) { return -1; }
                if(a[colIndex] < b[colIndex]) { return 1; }
                return 0;
            });
        }
    }

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
    if("LastEvaluatedKey" in data) {
        console.log("LastEvaluatedKey:", JSON.stringify(data.LastEvaluatedKey));
    }
    if("ScannedCount" in data) {
        console.log("ScannedCount:", data.ScannedCount);
    }
};

function getAllScannedAttributeNames(items) {
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
}

//
// Convert scan/query result to 2-D array
//
function convertItemsTo2dArray(items, colNames) {
    var rows = [];
    items.forEach(function(item) {
        var cols = [];
        colNames.forEach(function(attrPath) {
            var value = refAttrByPath(item, attrPath);
            if(value == null) {
                value = "";
            }
            cols.push(value);
        });
        rows.push(cols);
    });
    return rows;
}

function refAttrByPath(item, attrPath) {
    var pathArray = attrPath.split('.');
    for(var i = 0; i < pathArray.length; i++) {
        var pathElement = pathArray[i];
        if(typeof(item) != "object"
                || !(pathElement in item))
        {
            return null;
        }
        item = item[pathElement];
        var types = Object.keys(item);
        if(types.length > 0) {
            var type = types[0];
            item = item[type];
            switch(type) {
            case 'N':
                if(item.match(/\./)) {
                    item = parseFloat(item);
                } else {
                    item = parseInt(item);
                }
                break;
            case "BOOL":
                item = (item == true);
                break;
            }
        }
    }
    return item;
}

module.exports = DynamoDbResultSet;
