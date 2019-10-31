"use strict";
var DynamoDbDataType = require("./dynamodb-data-type.js");
function DynamoDbDataModels() {}
DynamoDbDataModels.obj2map = function(value) {
    if(value == "null") {
        throw new Error("Cannot convert null");
    }
    var type = DynamoDbDataType.detect(value);
    var typeid = DynamoDbDataType.type2id[type];
    var map = {};
    switch(type) {
        case "Buffer":
            if(typeof(value) == "string") {
                map[typeid] = Buffer.from(value, "base64");
            } else {
                map[typeid] = value;
            }
            break;
        case "boolean":
            map[typeid] = (value ? "true" : "false");
            break;
        case "object":
            {
                let obj = {};
                Object.keys(value).forEach(function(key) {
                    obj[key] = DynamoDbDataModels.obj2map(value[key]);
                });
                map[typeid] = obj;
            }
            break;
        case "List":
            {
                let obj = [];
                value.forEach(function(element) {
                    obj.push(DynamoDbDataModels.obj2map(element));
                });
                map[typeid] = obj;
            }
            break;
        case "BufferSet":
        case "StringSet":
            {
                let obj = [];
                value.forEach(function(element) {
                    obj.push(element);
                });
                map[typeid] = obj;
            }
            break;
        case "NumberSet":
            {
                let obj = [];
                value.forEach(function(element) {
                    obj.push("" + element);
                });
                map[typeid] = obj;
            }
            break;
        case "number":
            map[typeid] = ("" + value);
            break;
        case "undefined":
            throw new Error("Cannot convert undefind");
        default:
            map[typeid] = value;
            break;
    }
    return map;
};
DynamoDbDataModels.map2obj = function(map) {
    var obj = {};
    Object.keys(map).forEach(function(key) {
        Object.keys(map[key]).forEach(function(type) {
            var value = map[key][type];
            switch(type) {
            case "S":
                obj[key] = value;
                break;
            case "N":
                obj[key] = parseInt(value);
                break;
            case "BOOL":
                obj[key] = (value=="true");
                break;
            case "M":
                obj[key] = DynamoDbDataModels.map2obj(value);
                break;
            }
        });
    });
    return obj;
};

module.exports = DynamoDbDataModels;
