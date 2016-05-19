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
    // ref https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/ReservedWords.html
    var keywords = [
        "ABORT", "ABSOLUTE", "ACTION", "ADD", "AFTER", "AGENT", "AGGREGATE", "ALL",
        "ALLOCATE", "ALTER", "ANALYZE", "AND", "ANY", "ARCHIVE", "ARE", "ARRAY",
        "AS", "ASC", "ASCII", "ASENSITIVE", "ASSERTION", "ASYMMETRIC", "AT", "ATOMIC",
        "ATTACH", "ATTRIBUTE", "AUTH", "AUTHORIZATION", "AUTHORIZE", "AUTO", "AVG", "BACK",
        "BACKUP", "BASE", "BATCH", "BEFORE", "BEGIN", "BETWEEN", "BIGINT", "BINARY",
        "BIT", "BLOB", "BLOCK", "BOOLEAN", "BOTH", "BREADTH", "BUCKET", "BULK",
        "BY", "BYTE", "CALL", "CALLED", "CALLING", "CAPACITY", "CASCADE", "CASCADED",
        "CASE", "CAST", "CATALOG", "CHAR", "CHARACTER", "CHECK", "CLASS", "CLOB",
        "CLOSE", "CLUSTER", "CLUSTERED", "CLUSTERING", "CLUSTERS", "COALESCE", "COLLATE", "COLLATION",
        "COLLECTION", "COLUMN", "COLUMNS", "COMBINE", "COMMENT", "COMMIT", "COMPACT", "COMPILE",
        "COMPRESS", "CONDITION", "CONFLICT", "CONNECT", "CONNECTION", "CONSISTENCY", "CONSISTENT", "CONSTRAINT",
        "CONSTRAINTS", "CONSTRUCTOR", "CONSUMED", "CONTINUE", "CONVERT", "COPY", "CORRESPONDING", "COUNT",
        "COUNTER", "CREATE", "CROSS", "CUBE", "CURRENT", "CURSOR", "CYCLE", "DATA",
        "DATABASE", "DATE", "DATETIME", "DAY", "DEALLOCATE", "DEC", "DECIMAL", "DECLARE",
        "DEFAULT", "DEFERRABLE", "DEFERRED", "DEFINE", "DEFINED", "DEFINITION", "DELETE", "DELIMITED",
        "DEPTH", "DEREF", "DESC", "DESCRIBE", "DESCRIPTOR", "DETACH", "DETERMINISTIC", "DIAGNOSTICS",
        "DIRECTORIES", "DISABLE", "DISCONNECT", "DISTINCT", "DISTRIBUTE", "DO", "DOMAIN", "DOUBLE",
        "DROP", "DUMP", "DURATION", "DYNAMIC", "EACH", "ELEMENT", "ELSE", "ELSEIF",
        "EMPTY", "ENABLE", "END", "EQUAL", "EQUALS", "ERROR", "ESCAPE", "ESCAPED",
        "EVAL", "EVALUATE", "EXCEEDED", "EXCEPT", "EXCEPTION", "EXCEPTIONS", "EXCLUSIVE", "EXEC",
        "EXECUTE", "EXISTS", "EXIT", "EXPLAIN", "EXPLODE", "EXPORT", "EXPRESSION", "EXTENDED",
        "EXTERNAL", "EXTRACT", "FAIL", "FALSE", "FAMILY", "FETCH", "FIELDS", "FILE",
        "FILTER", "FILTERING", "FINAL", "FINISH", "FIRST", "FIXED", "FLATTERN", "FLOAT",
        "FOR", "FORCE", "FOREIGN", "FORMAT", "FORWARD", "FOUND", "FREE", "FROM",
        "FULL", "FUNCTION", "FUNCTIONS", "GENERAL", "GENERATE", "GET", "GLOB", "GLOBAL",
        "GO", "GOTO", "GRANT", "GREATER", "GROUP", "GROUPING", "HANDLER", "HASH",
        "HAVE", "HAVING", "HEAP", "HIDDEN", "HOLD", "HOUR", "IDENTIFIED", "IDENTITY",
        "IF", "IGNORE", "IMMEDIATE", "IMPORT", "IN", "INCLUDING", "INCLUSIVE", "INCREMENT",
        "INCREMENTAL", "INDEX", "INDEXED", "INDEXES", "INDICATOR", "INFINITE", "INITIALLY", "INLINE",
        "INNER", "INNTER", "INOUT", "INPUT", "INSENSITIVE", "INSERT", "INSTEAD", "INT",
        "INTEGER", "INTERSECT", "INTERVAL", "INTO", "INVALIDATE", "IS", "ISOLATION", "ITEM",
        "ITEMS", "ITERATE", "JOIN", "KEY", "KEYS", "LAG", "LANGUAGE", "LARGE",
        "LAST", "LATERAL", "LEAD", "LEADING", "LEAVE", "LEFT", "LENGTH", "LESS",
        "LEVEL", "LIKE", "LIMIT", "LIMITED", "LINES", "LIST", "LOAD", "LOCAL",
        "LOCALTIME", "LOCALTIMESTAMP", "LOCATION", "LOCATOR", "LOCK", "LOCKS", "LOG", "LOGED",
        "LONG", "LOOP", "LOWER", "MAP", "MATCH", "MATERIALIZED", "MAX", "MAXLEN",
        "MEMBER", "MERGE", "METHOD", "METRICS", "MIN", "MINUS", "MINUTE", "MISSING",
        "MOD", "MODE", "MODIFIES", "MODIFY", "MODULE", "MONTH", "MULTI", "MULTISET",
        "NAME", "NAMES", "NATIONAL", "NATURAL", "NCHAR", "NCLOB", "NEW", "NEXT",
        "NO", "NONE", "NOT", "NULL", "NULLIF", "NUMBER", "NUMERIC", "OBJECT",
        "OF", "OFFLINE", "OFFSET", "OLD", "ON", "ONLINE", "ONLY", "OPAQUE",
        "OPEN", "OPERATOR", "OPTION", "OR", "ORDER", "ORDINALITY", "OTHER", "OTHERS",
        "OUT", "OUTER", "OUTPUT", "OVER", "OVERLAPS", "OVERRIDE", "OWNER", "PAD",
        "PARALLEL", "PARAMETER", "PARAMETERS", "PARTIAL", "PARTITION", "PARTITIONED", "PARTITIONS", "PATH",
        "PERCENT", "PERCENTILE", "PERMISSION", "PERMISSIONS", "PIPE", "PIPELINED", "PLAN", "POOL",
        "POSITION", "PRECISION", "PREPARE", "PRESERVE", "PRIMARY", "PRIOR", "PRIVATE", "PRIVILEGES",
        "PROCEDURE", "PROCESSED", "PROJECT", "PROJECTION", "PROPERTY", "PROVISIONING", "PUBLIC", "PUT",
        "QUERY", "QUIT", "QUORUM", "RAISE", "RANDOM", "RANGE", "RANK", "RAW",
        "READ", "READS", "REAL", "REBUILD", "RECORD", "RECURSIVE", "REDUCE", "REF",
        "REFERENCE", "REFERENCES", "REFERENCING", "REGEXP", "REGION", "REINDEX", "RELATIVE", "RELEASE",
        "REMAINDER", "RENAME", "REPEAT", "REPLACE", "REQUEST", "RESET", "RESIGNAL", "RESOURCE",
        "RESPONSE", "RESTORE", "RESTRICT", "RESULT", "RETURN", "RETURNING", "RETURNS", "REVERSE",
        "REVOKE", "RIGHT", "ROLE", "ROLES", "ROLLBACK", "ROLLUP", "ROUTINE", "ROW",
        "ROWS", "RULE", "RULES", "SAMPLE", "SATISFIES", "SAVE", "SAVEPOINT", "SCAN",
        "SCHEMA", "SCOPE", "SCROLL", "SEARCH", "SECOND", "SECTION", "SEGMENT", "SEGMENTS",
        "SELECT", "SELF", "SEMI", "SENSITIVE", "SEPARATE", "SEQUENCE", "SERIALIZABLE", "SESSION",
        "SET", "SETS", "SHARD", "SHARE", "SHARED", "SHORT", "SHOW", "SIGNAL",
        "SIMILAR", "SIZE", "SKEWED", "SMALLINT", "SNAPSHOT", "SOME", "SOURCE", "SPACE",
        "SPACES", "SPARSE", "SPECIFIC", "SPECIFICTYPE", "SPLIT", "SQL", "SQLCODE", "SQLERROR",
        "SQLEXCEPTION", "SQLSTATE", "SQLWARNING", "START", "STATE", "STATIC", "STATUS", "STORAGE",
        "STORE", "STORED", "STREAM", "STRING", "STRUCT", "STYLE", "SUB", "SUBMULTISET",
        "SUBPARTITION", "SUBSTRING", "SUBTYPE", "SUM", "SUPER", "SYMMETRIC", "SYNONYM", "SYSTEM",
        "TABLE", "TABLESAMPLE", "TEMP", "TEMPORARY", "TERMINATED", "TEXT", "THAN", "THEN",
        "THROUGHPUT", "TIME", "TIMESTAMP", "TIMEZONE", "TINYINT", "TO", "TOKEN", "TOTAL",
        "TOUCH", "TRAILING", "TRANSACTION", "TRANSFORM", "TRANSLATE", "TRANSLATION", "TREAT", "TRIGGER",
        "TRIM", "TRUE", "TRUNCATE", "TTL", "TUPLE", "TYPE", "UNDER", "UNDO",
        "UNION", "UNIQUE", "UNIT", "UNKNOWN", "UNLOGGED", "UNNEST", "UNPROCESSED", "UNSIGNED",
        "UNTIL", "UPDATE", "UPPER", "URL", "USAGE", "USE", "USER", "USERS",
        "USING", "UUID", "VACUUM", "VALUE", "VALUED", "VALUES", "VARCHAR", "VARIABLE",
        "VARIANCE", "VARINT", "VARYING", "VIEW", "VIEWS", "VIRTUAL", "VOID", "WAIT",
        "WHEN", "WHENEVER", "WHERE", "WHILE", "WINDOW", "WITH", "WITHIN", "WITHOUT",
        "WORK", "WRAPPED", "WRITE", "YEAR", "ZONE"
    ];
    awscli.dynamodb.isKeyword = function(name) {
        return keywords.indexOf(name.toUpperCase()) >= 0;
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
                    dataModel[key] = (value=="true");
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
        var pathes = path.split('.');
        pathes.forEach(function(path) {
            dataitem = dataitem[path];
            var types = Object.keys(dataitem);
            if(types.length > 0) {
                var type = types[0];
                dataitem = dataitem[type];
                switch(type) {
                case 'N':
                    dataitem = parseInt(dataitem);
                    break;
                case "BOOL":
                    dataitem = (dataitem == "true");
                    break;
                }
            }
        });
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
        var buf = listit.buffer();
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

    //
    // Condition expression parser
    //
    var ConditionExpression = function() {
    };

    //
    // Lexical token
    //
    ConditionExpression.LexTok = {
        "bool" : [ "true", "false" ],
        "comp" : [ "=", "<>", "<=", ">=", "<", ">" ],
        "oper" : [ "AND", "OR", "NOT", "BETWEEN", "IN" ],
        "deli" : [ ",", "(", ")" ],
        "func" : [ "attribute_exists", "attribute_not_exists",
            "attribute_type", "begins_with", "contains", "size" ]
    };

    ConditionExpression.prototype.getExpression = function() {
        return '"' + this.expression.join(" ") + '"';
    };
    ConditionExpression.prototype.getAttributeNames = function() {
        if(Object.keys(this.names).length <= 0) {
            return null;
        }
        return this.names;
    };
    ConditionExpression.prototype.getAttributeValues = function() {
        if(Object.keys(this.values).length <= 0) {
            return null;
        }
        return this.values;
    };

    //
    // Parse
    //
    ConditionExpression.prototype.parse = function(expr) {
        this.tokens = [];
        this.expression = [];
        this.names = {};
        this.values = {};

        this.tokenize(expr);

        var vidx = 0;
        this.tokens.forEach(function(token) {
            switch(token.type) {
            case "bool":
                this.expression.push(":v" + vidx);
                this.values[":v" + vidx] = { "BOOL" : "" + token.lex };
                vidx++;
                break;
            case "num":
                this.expression.push(":v" + vidx);
                this.values[":v" + vidx] = { "N" : "" + token.lex };
                vidx++;
                break;
            case "str":
                this.expression.push(":v" + vidx);
                this.values[":v" + vidx] = { "S" : "" + token.lex };
                vidx++;
                break;
            case "ident":
                this.expression.push(
                    token.lex.split('.').map(
                        function(ident) {
                            if(awscli.dynamodb.isKeyword(ident)) {
                                var alt = "#" + ident;
                                this.names[alt] = ident;
                                return alt;
                            }
                            return ident;
                        }, this).join('.'));
                break;
            default:
                this.expression.push(token.lex);
                break;
            }
        }, this);
    };

    //
    // Lexical analysis
    //
    ConditionExpression.prototype.tokenize = function(expr) {
        while(true) {
            expr = expr.replace(/^\s*/, '');
            if(expr.length == 0) {
                break;
            }
            var toktypes = Object.keys(ConditionExpression.LexTok);
            var token = null;
            for(var t = 0; t < toktypes.length; t++) {
                var toklist = ConditionExpression.LexTok[toktypes[t]];
                for(var i = 0; i < toklist.length; i++) {
                    if(expr.substr(0, toklist[i].length) == toklist[i]) {
                        token = {
                            "type": toktypes[t],
                            "lex": toklist[i]
                        };
                        expr = expr.substr(toklist[i].length);
                        break;
                    }
                }
            }
            var i = 0;
            if(token == null) {
                switch(expr.charAt(0)) {
                case '"':
                    token = { "type": "str", "lex" : "" };
                    i++;
                    while(true) {
                        if(i >= expr.length) {
                            console.error("Error Condition Expression: String not closed.");
                            process.exit(1);
                        }
                        var c = expr.charAt(i);
                        ++i;
                        if(c == '\\') {
                            token.lex += expr.charAt(i);
                            ++i;
                        } else if(c == '"') {
                            break;
                        } else {
                            token.lex += c;
                        }
                    }
                    break;
                case "'":
                    token = { "type": "str", "lex" : "" };
                    i++;
                    while(true) {
                        if(i >= expr.length) {
                            console.error("Error Condition Expression: String not closed.");
                            process.exit(1);
                        }
                        var c = expr.charAt(i);
                        ++i;
                        if(c == '\\') {
                            token.lex += c;
                            ++i;
                        } else if(c == "'") {
                            break;
                        } else {
                            token.lex += c;
                        }
                    }
                    break;
                case "0": case "1": case "2": case "3": case "4":
                case "5": case "6": case "7": case "8": case "9":
                    token = { "type": "num", "lex" : "" };
                    while(true) {
                        var c = expr.charAt(i);
                        if(!c.match(/[0-9\.]/i)) {
                            if(c.match(/[_a-z]/i)) {
                                console.error("Error in ConditionExpression : invalid char in number",
                                    expr.charAt(i));
                                process.exit(1);
                            }
                            break;
                        } else {
                            token.lex += c;
                            ++i;
                        }
                    }
                    break;
                default:
                    token = { "type": "ident", "lex" : "" };
                    while(true) {
                        var c = expr.charAt(i);
                        if(!c.match(/[_a-z0-9\.]/i)) {
                            break;
                        } else {
                            token.lex += c;
                            ++i;
                        }
                    }
                    break;
                }
                if(i == 0 || token.lex == "") {
                    console.error("Error in ConditionExpression : invalid char ",
                        expr.charAt(i));
                    process.exit(1);
                } else {
                    expr = expr.substr(i);
                }
            }
            this.tokens.push(token);
        }
    };
    awscli.dynamodb.parseProjectionExpression = function(
            projectionExpression, expressionAttributeNames)
    {
        var tokens = [];
        var names = projectionExpression.split(/\s*,\s*/);
        names.forEach(function(name) {
            if(awscli.dynamodb.isKeyword(name)) {
                var ph = "#" + name;
                tokens.push(ph);
                expressionAttributeNames[ph] = name;
            } else {
                tokens.push(name);
            }
        });
        return tokens.join(',');
    };
    awscli.dynamodb.parseConditionExpression = function(
            conditionExpression,
            expressionAttributeNames,
            expressionAttributeValues)
    {
        var parser = new ConditionExpression();
        parser.parse(conditionExpression);

        var names = parser.getAttributeNames();
        if(names) {
            Object.keys(names).forEach(function(ph) {
                expressionAttributeNames[ph] = names[ph];
            });
        }

        var values = parser.getAttributeValues();
        if(values) {
            Object.keys(values).forEach(function(ph) {
                expressionAttributeValues[ph] = values[ph];
            });
        }

        return parser.getExpression();
    };
    module.exports = awscli.dynamodb;
}());
