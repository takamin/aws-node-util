"use strict";

//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putItem-property

function DynamoDbDataType() {
    this._is = {
        BufferSequence: true,
        NumberSequence: true,
        StringSequence: true,
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
    "BufferSequence": "BS",
    "boolean": "BOOL",
    "List": "L",
    "object": "M",
    "number": "N",
    "NumberSequence": "NS",
    "string": "S",
    "StringSequence": "SS",
};
DynamoDbDataType.prototype.countPossibleType = function(element) {
    var count = 0;
    Object.keys(this._is).forEach(function(key) {
        if(this._is[key]) {
            count++;
        }
    }.bind(this));
    return count;
};
DynamoDbDataType.prototype.getPossibleType = function(element) {
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
DynamoDbDataType.prototype.getPredictedType = function(element) {
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
            this._is.NumberSequence = false;
            this._is.StringSequence = false;
            break;
        case "number":
            this._is.BufferSequence = false;
            this._is.StringSequence = false;
            break;
        case "string":
            this._is.BufferSequence = false;
            this._is.NumberSequence = false;
            break;
        default:
            this._is.BufferSequence = false;
            this._is.StringSequence = false;
            this._is.NumberSequence = false;
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
DynamoDbDataType.debug = false;
var logIndex = 0;
function log() {
    if( DynamoDbDataType.debug ) {
        console.log("[" + logIndex + "]:", Array.from(arguments).join(" "));
        logIndex++;
    }
}
module.exports = DynamoDbDataType;
