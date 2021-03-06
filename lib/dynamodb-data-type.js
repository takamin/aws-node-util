"use strict";

//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putItem-property

function DynamoDbDataType() {
    this._is = {
        BufferSet: true,
        NumberSet: true,
        StringSet: true,
        List: true
    };
}
DynamoDbDataType.primaryTypeOf = function(value) {
    if(value === null) {
        return "null";
    }
    if(Buffer.isBuffer(value)) {
        return "Buffer";
    }
    if(Array.isArray(value)) {
        return "Array";
    }
    return typeof(value);
};
DynamoDbDataType.type2id = {
    "Buffer": "B",
    "BufferSet": "BS",
    "boolean": "BOOL",
    "List": "L",
    "object": "M",
    "number": "N",
    "NumberSet": "NS",
    "string": "S",
    "StringSet": "SS",
};
DynamoDbDataType.prototype.countPossibleType = function() {
    var count = 0;
    Object.keys(this._is).forEach(function(key) {
        if(this._is[key]) {
            count++;
        }
    }.bind(this));
    return count;
};
DynamoDbDataType.prototype.getPossibleType = function() {
    var type = null;
    var count = 0;
    Object.keys(this._is).forEach(function(key) {
        if(this._is[key]) {
            type = key;
            count++;
        }
    }.bind(this));
    if(count > 1) {
        type = false;
    }
    return type;
};
DynamoDbDataType.prototype.getPredictedType = function() {
    var count = this.countPossibleType();
    if(count > 1 && this._is.List) {
        this._is.List = false;
        count--;
    }
    var type = null;
    switch(count) {
        case 0:
            type = null;
            break;
        case 1:
            type = this.getPossibleType();
            break;
        default:
            type = false;
            break;
    }
    return type;
};
DynamoDbDataType.prototype.checkElementType = function(element) {
    switch(DynamoDbDataType.primaryTypeOf(element)) {
        case "Buffer":
            this._is.NumberSet = false;
            this._is.StringSet = false;
            break;
        case "number":
            this._is.BufferSet = false;
            this._is.StringSet = false;
            break;
        case "string":
            this._is.BufferSet = false;
            this._is.NumberSet = false;
            break;
        default:
            this._is.BufferSet = false;
            this._is.StringSet = false;
            this._is.NumberSet = false;
            break;
    }
    return this.getPossibleType();
};
DynamoDbDataType.detect = function(value) {
    var type = DynamoDbDataType.primaryTypeOf(value);
    if(type == "Array") {
        var detector = new DynamoDbDataType();
        var arrtype = false;
        var len = value.length;
        for(var i = 0; i < len && arrtype === false; i++) {
            arrtype = detector.checkElementType(value[i]);
        }
        if(arrtype == false || arrtype == null) {
            arrtype = detector.getPredictedType();
        }
        type = arrtype;
    }
    return type;
};
module.exports = DynamoDbDataType;
