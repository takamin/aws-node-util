(function() {
    "use strict";

    //
    // ref https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/ReservedWords.html
    //
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

    var isKeyword = function(name) {
        return keywords.indexOf(name.toUpperCase()) >= 0;
    };

    //
    // Expression parser
    //
    var Expression = function() { };

    //
    // Lexical token
    //
    Expression.LexTok = {
        "bool" : [ "true", "false" ],
        "comp" : [ "=", "<>", "<=", ">=", "<", ">" ],
        "oper" : [ "AND", "OR", "NOT", "BETWEEN", "IN" ],
        "deli" : [ ",", "(", ")" ],
        "func" : [ "attribute_exists", "attribute_not_exists",
            "attribute_type", "begins_with", "contains", "size" ]
    };

    //
    // Lexical analysis
    //
    Expression.prototype.tokenize = function(expr) {
        while(true) {
            expr = expr.replace(/^\s*/, '');
            if(expr.length == 0) {
                break;
            }
            var toktypes = Object.keys(Expression.LexTok);
            var token = null;
            for(var t = 0; t < toktypes.length; t++) {
                var toklist = Expression.LexTok[toktypes[t]];
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
                case "-":
                case "0": case "1": case "2": case "3": case "4":
                case "5": case "6": case "7": case "8": case "9":
                    token = { "type": "num", "lex" : "" };
                    while(true) {
                        var c = expr.charAt(i);
                        if(!c.match(/[\-0-9\.]/i)) {
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

    var ProjectionExpressionError = function(message, expr) {
        this.message = message;
        this.expr = expr;
    };
    var ProjectionExpression = function() {};
    ProjectionExpression.prototype = new Expression();
    ProjectionExpression.prototype.parse = function(expr) {
        this.tokens = [];
        this.expression = [];
        this.names = {};

        this.tokenize(expr);

        this.tokens.forEach(function(token) {
            switch(token.type) {
            case "ident":
                this.expression.push(
                    token.lex.split('.').map(
                        function(ident) {
                            if(isKeyword(ident)) {
                                var alt = "#" + ident;
                                this.names[alt] = ident;
                                return alt;
                            }
                            return ident;
                        }, this).join('.'));
                break;
            case 'deli':
                if(token.lex == ',') {
                    this.expression.push(token.lex);
                } else {
                    throw new ProjectionExpressionError("Error: Invalid delimitor.", expr);
                }
                break;
            default:
                throw new ProjectionExpressionError("Error: R-Value cannot be included.", expr);
                break;
            }
        }, this);
    };
    ProjectionExpression.prototype.getExpression = function() {
        return this.expression.join(" ");
    };
    ProjectionExpression.prototype.getAttributeNames = function() {
        if(Object.keys(this.names).length <= 0) {
            return null;
        }
        return this.names;
    };

    //
    // Condition expression parser
    //
    var ConditionExpression = function() { };
    ConditionExpression.prototype = new Expression();

    ConditionExpression.prototype.getExpression = function() {
        return this.expression.join(" ");
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
                this.values[":v" + vidx] = { "BOOL" : (token.lex == "true") };
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
                            if(isKeyword(ident)) {
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
    // ItemList expression parser
    //
    // Parser class to convert a string of a comma separated assignment expression to
    // DynamoDB map object representing its Item.
    //
    // EXAMPLE:
    //
    //  input string:
    //      id="123",timestamp=145678900,test.name="foo",test.pass=true,value.version="0.6.6"
    //
    //  output object:
    //      {
    //          "id":       {"S": "123"},
    //          "timestamp":{"N": "145678900"},
    //          "test": {
    //              "M": {
    //                  "name": {"S": "foo"},
    //                  "pass": {"BOOL": true}
    //              }
    //          },
    //          "value" : {"M" : {"version": {"S": "0.6.6"}}}
    //      }
    //
    var ItemListExpressionError = function(message, expr) {
        this.message = message;
        this.expr = expr;
    };
    var ItemListExpression = function() {};
    ItemListExpression.prototype = new Expression();
    ItemListExpression.prototype.parse = function(itemList) {
        var map = {};
        this.tokens = [];
        this.tokenize(itemList);
        
        var attributeItems = [];
        var attributeItem = [];
        this.tokens.forEach(function(token) {
            if(token.type == "deli" && token.lex == ",") {
                attributeItems.push(attributeItem);
                attributeItem = [];
            } else {
                attributeItem.push(token);
            }
        });
        attributeItems.push(attributeItem);
        attributeItems.forEach(function(attributeItem) {
            var expr = attributeItem.map(function(token) { return token.lex; }).join(" ");
            if(attributeItem.length != 3) {
                throw new ItemListExpressionError("Error: Invalid format.", expr);
            } else if(attributeItem[0].type != "ident") {
                throw new ItemListExpressionError("Error: Lvalue must be a item name or map path.", expr);
            } else if(attributeItem[1].type != "comp" || attributeItem[1].lex != "=") {
                throw new ItemListExpressionError("Error: The expression must be an assignment.", expr);
            } else if(attributeItem[2].type != "bool" &&
                    attributeItem[2].type != "str" &&
                    attributeItem[2].type != "num")
            {
                throw new ItemListExpressionError("Error: Rvalue must be a value.", expr);
            }
            var LTok = attributeItem[0];
            var RTok = attributeItem[2];
            var paths = LTok.lex.split('.');
            var obj = map;
            for(var i = 0; i < paths.length; i++) {
                var path = paths[i];
                if(!(path in obj)) {
                    if(i < paths.length - 1) {
                        obj[path] = { "M" : {} };
                    } else {
                        obj[path] = { /* T.B.D */ };
                    }
                }
                if("M" in obj[path]) {
                    obj = obj[path].M;
                } else {
                    obj = obj[path];
                }
            }
            switch(RTok.type) {
            case "bool":
                obj["BOOL"] = (RTok.lex == "true");
                break;
            case "num":
                obj["N"] = "" + RTok.lex;
                break;
            case "str":
                obj["S"] = "" + RTok.lex;
                break;
            }
        });
        return map;
    };

    var parseProjectionExpression = function(
            projectionExpression, expressionAttributeNames)
    {
        var parser = new ProjectionExpression();
        parser.parse(projectionExpression);
        var names = parser.getAttributeNames();
        if(names) {
            Object.keys(names).forEach(function(ph) {
                expressionAttributeNames[ph] = names[ph];
            });
        }
        return parser.getExpression();
    };
    var parseConditionExpression = function(
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


    //
    // Parse ItemList expression and returns DynamoDB table item for put-item operation.
    //
    // EXAMPLE:
    //
    //  input string:
    //      id="123",timestamp=145678900,test.name="foo",test.pass=true,value.version="0.6.6"
    //
    //  output object:
    //      {
    //          "id":       {"S": "123"},
    //          "timestamp":{"N": "145678900"},
    //          "test": {
    //              "M": {
    //                  "name": {"S": "foo"},
    //                  "pass": {"BOOL": true}
    //              }
    //          },
    //          "value" : {"M" : {"version": {"S": "0.6.6"}}}
    //      }
    //
    var parseItemListToMap = function(itemList) {
        var parser = new ItemListExpression();
        var map = null;
        try {
            map = parser.parse(itemList);
        } catch (ex) {
            console.error(ex.message, ex.expr);
            process.exit(1);
        }
        return map;
    };

    var parsers = {
        keywords: keywords,
        isKeyword: isKeyword,

        parseProjectionExpression: parseProjectionExpression,
        parseConditionExpression: parseConditionExpression,
        parseItemListToMap: parseItemListToMap
    };
    module.exports = parsers;
}());
