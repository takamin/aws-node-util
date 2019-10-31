"use strict";
var Statement = require('./dynamodb-statement.js');
const DynamoDbDataModels = require("./dynamodb-data-models.js");

/**
 * SQL-ish PutItem statement class for AWS DynamoDB.
 *
 * @param {string|object} opt
 * SQL-ish PutItem statement as string or parameter object
 * for PutItem API.
 *
 * @constructor
 */
function DynamoDbPutItemStatement(opt) {
    Statement.apply(this, Array.from(arguments));
    this._itemAttr = null;
    this.item = {};

    if(!opt) {
        return;
    }
    if(typeof(opt) === "string") {
        opt = this.parse(opt);
        this._itemAttr = {
            names: opt._attrNames,
            values: opt._attrNames
        };
    }
    if(!("TableName" in opt)) {
        throw new Error("TableName required");
    }
    if(!("Item" in opt)) {
        throw new Error("Item required");
    }
    this.setTableName(opt.TableName);
    this.item = this._parser.parseItemListToMap(opt.Item);
    if("ConditionExpression" in opt) {
        this.conditionExpression =
            this.parseConditionExpression( opt.ConditionExpression );
    }
}


DynamoDbPutItemStatement.prototype = new Statement();

DynamoDbPutItemStatement.prototype.parse = function(sqlish) {
    var opt = {};
    var st = this._parser.parsePutItem(sqlish);

    var tableName = st.getTerm("table-name");
    if(!tableName.match) {
        throw new Error("the table-name not found");
    }
    opt.TableName = st.getWordsList("table-name")[0].join("");

    opt._attrNames =
        st.getTerm("attribute-list")
        .getWordsList("attribute-name")
        .map( (arr) => { return arr[0]; } );
    
    opt._values =
        st.getTerm("value-list")
        .getWordsList("value")
        .map( (arr) => { return arr[0]; } );

    if(opt._attrNames.length != opt._values.length) {
        throw new Error("the number of attribute names and values are not match.");
    }

    opt.Item = opt._attrNames.map((name, index) => {
        return [name, opt._values[index]].join("=");
    }).join(",");

    var whereClause = st.getTerm("where-key-clause");
    if(whereClause.match) {
        opt.ConditionExpression =
            whereClause.getWordsList("condition-expression")[0].join(" ");
    }

    return opt;
};

/**
 * Set an item to this statement.
 * The item will be put to the DynamoDB when this statement ran.
 *
 * @param {array|object} values
 * If this is array, it must contain values as same order for the
 * attributes specified as SQL in the constructor.
 * If this is an object, the key is an attribute names.
 * Whether each cases above, the attribute names must be specified by
 * SQL-ish statement at the constructor.
 * The values will be converted to DynamoDB Map Object.
 * So, you can specify a value as is. 
 *
 * @returns {undefined}
 */
DynamoDbPutItemStatement.prototype.setValues = function(values) {
    if(Array.isArray(values)) {
        if(this._itemAttr == null) {
            throw new Error("could not set values. there is no attrinute names.");
        } else if(values.length != this._itemAttr.names.length) {
            throw new Error("The invalid values. its length unmatch to names.");
        } else {
            this._itemAttr.names.forEach( (name, i) => {
                this.item[name] = DynamoDbDataModels.obj2map(values[i]);
            });
        }
    } else if(typeof(values) === "object") {
        Object.keys(values).forEach( name => {
            if(!(name in this.item)) {
                throw new Error("name not exists in attributes");
            }
            this.item[name] = DynamoDbDataModels.obj2map(values[name]);
        });
    }
};

/**
 * Run the statement in async.
 *
 * @param {array|object} args
 * This parameter can be what is same to the parameter of `setValues`
 * method. If it is an array, it contains the values of attributes.
 * Or if it is an object, its key that do not start with ':'
 * represents the attribute names.
 *
 * @param {Function} callback
 * The callback function to get an error.
 * The declaration is (err) => { ... }.
 *
 * @returns {undefined}
 *
 * @see #setValues
 */
DynamoDbPutItemStatement.prototype.run = function(args, callback) {
    var argsClass = this.classifyValuesAndPlaceholders(args);
    let values = argsClass.values;
    let placeholders = argsClass.placeholders;

    if(values != null) {
        this.setValues(values);
    }
    var param = this.getParameter(placeholders);
    Statement.assertAllParamSpecified(param);
    this.dynamodb.putItem(param, callback);
};

DynamoDbPutItemStatement.prototype.classifyValuesAndPlaceholders = function(args) {
    let values = null;
    let placeholders = {};
    if(Array.isArray(args)) {
        values = args;
    } else if(typeof(args) === "object") {
        Object.keys(args).forEach( key => {
            if(key.match("^:")) {
                placeholders[key] = args[key];
            } else {
                if(values == null) {
                    values = {};
                }
                values[key] = args[key];
            }
        });
    }
    return { values: values, placeholders: placeholders };
};

DynamoDbPutItemStatement.prototype.getParameter = function(args) {
    var opt = Statement.prototype.getParameter.call(this, args);
    if(this.conditionExpression) {
        opt.ConditionExpression = this.conditionExpression;
    }
    if(this.item) {
        opt.Item = this.item;
    }
    return opt;
};
module.exports = DynamoDbPutItemStatement;
