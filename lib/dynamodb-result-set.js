"use strict";
var listit = require('list-it');

//
// Print scan result to console
//
function printScanResult(data, sortItemPath, sortDesc) {
    var colNames = getAllScannedAttributeNames(data.Items);
    var rows = convertItemsTo2dArray(data, colNames);
    rows = sortRowsByColumnPath(rows, colNames, sortItemPath, sortDesc);

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
}

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
function convertItemsTo2dArray(data, colNames) {
    var rows = [];
    data.Items.forEach(function(item) {
        var cols = [];
        colNames.forEach(function(pathItem) {
            var value = refAttrByPath(item, pathItem);
            if(value == null) {
                value = "";
            }
            cols.push(value);
        });
        rows.push(cols);
    });
    return rows;
}

function refAttrByPath(obj, path) {
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
}

function sortRowsByColumnPath(rows, colNames, sortItemPath, sortDesc) {
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
}

module.exports = {
    printScanResult: printScanResult
};
