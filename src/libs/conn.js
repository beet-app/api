var mysql = require('mysql');
var q = require("q");
var common = require("../libs/common");
var config = common.getConfig('database');

var lib = {
    query: function (queryBuilder) {
        var connection = mysql.createConnection(config);

        connection.connect();

        var x, value;
        var d = new q.defer();

        var arrFields = queryBuilder.fields;
        var filters = queryBuilder.filters;


        var fields = "";
        if (arrFields !== undefined) {
            for (x = 0; x < arrFields.length; x++) {
                fields += (fields == "") ? arrFields[x] : "," + arrFields[x];
            }
        }else{
            fields = "*"
        }

        var where = "";
        if (filters !== undefined){
            if (filters.length === undefined){
                if (!filters.operator){
                    filters.operator = "=";
                }
                value = connection.escape(filters.value);
                where += (where == "") ? filters.field + filters.operator + value + "" : " AND " + filters.field + filters.operator + value + "";
            }else{
                for (x = 0; x < filters.length; x++) {
                    if (!filters[x].operator){
                        filters[x].operator = "=";
                    }
                    value = connection.escape(filters[x].value);
                    where += (where == "") ? filters[x].field + filters[x].operator + value + "" : " AND " + filters[x].field + filters[x].operator + value + "";
                }
            }

        }
        var query = "SELECT " + fields;

        query += " FROM " + queryBuilder.table;
        if (where != ""){
            query += " WHERE " + where;
        }





        common.log(query);
        connection.query(query, function(err, rows, fields) {
            d.resolve({
                err:err,
                rows:err===null ? rows : [],
                fields:fields
            });
        });

        connection.end();

        return d.promise;




    },
    freeQuery: function (query) {
        var d = new q.defer();

        var connection = mysql.createConnection(config);
        connection.connect();

        var debug=true;

        if (debug){
            common.log(query);
            d.resolve({
                err:null,
                rows:[],
                fields:[]
            });
        }else{
            connection.query(query, function(err, rows, fields) {
                var obj = (err===null) ? rows : err;
                common.logQuery(query, obj);
                d.resolve({
                    error:err,
                    rows:err===null ? rows : [],
                    fields:fields
                });

            });
        }


        connection.end();

        return d.promise;

    },
    freeExec: function (query) {
        var d = new q.defer();

        var connection = mysql.createConnection(config);
        connection.connect();


        var debug=true;

        if (debug){
            common.log(query);
            d.resolve({
                err:null,
                result:[]
            });
        }else{
            connection.query(query, function(err, result) {
                var obj = (err===null) ? result : err;
                common.logQuery(query, obj);
                d.resolve({
                    err:err,
                    result:err===null ? result : []
                });
            });
        }


        connection.end();

        return d.promise;
    },
    getInsertSql: function (obj) {
        var arr = common.turnToArray(obj.fields);
        var sql="";
        for (var x = 0 ; x < arr.length ; x++){
            var fields = "";
            var values = "";
            for (var key in arr[x]) {
                fields += (fields == "") ? key : "," + key;
                values += (values == "") ? "'" + arr[x][key] + "'" : ",'" + arr[x][key] + "'";
            }
            sql += "INSERT INTO " + obj.table + " (" + fields + ") VALUES (" + values + ");";
        }
        return sql;
    },
    getUpdateSql: function (obj) {
        var arr = common.turnToArray(obj.fields);
        var sql="";
        for (var x = 0 ; x < arr.length ; x++){
            var fields = "1=1";
            var where = "";
            for (key in arr[x]){
                fields += ","+key+"='"+arr[x][key]+"'";
            }
            for (key in obj.indexes){
                where += (where=="") ? obj.indexes[key]+"='"+arr[x][obj.indexes[key]]+"'" : " AND "+obj.indexes[key]+"='"+arr[x][obj.indexes[key]]+"'";
            }
            sql +=  "UPDATE " + obj.table + " SET " + fields + " WHERE " + where + ";";
        }
        return sql;
    },
    getExistsSql: function (obj) {
        var arr = common.turnToArray(obj.fields);
        var sql="";
        for (var x = 0 ; x < arr.length ; x++){
            var fields = "";
            var where = "";
            for (var key in obj.indexes){
                fields += (fields=="") ? obj.indexes[key] : ","+obj.indexes[key];
                where += (where=="") ? obj.indexes[key]+"='"+arr[x][obj.indexes[key]]+"'" : " AND "+obj.indexes[key]+"='"+arr[x][obj.indexes[key]]+"'";
            }
            sql +=   "SELECT " + fields + " FROM " + obj.table + " WHERE " + where + ";";
        }
        return sql;
    },
    getDeleteBeforeInsertSql: function (obj) {
        var arr = common.turnToArray(obj.fields);
        var sql="";
        for (var x = 0 ; x < arr.length ; x++){
            var where = "";
            for (var key in obj.indexes){
                where += (where=="") ? obj.indexes[key]+"='"+arr[x][obj.indexes[key]]+"'" : " AND "+obj.indexes[key]+"='"+arr[x][obj.indexes[key]]+"'";
            }
            sql +=   "DELETE FROM " + obj.table + " WHERE " + where + ";";
        }
        return sql;
    },
    save: function (obj) {
        var d = new q.defer();

        var parent = (obj.parent) ? obj.parent : obj;

        var sql = "";

        lib.freeQuery(lib.getExistsSql(parent)).then(function(parentExists) {
            if (parentExists.rows.length > 0){
                sql = lib.getUpdateSql(parent);
            }else{
                sql = lib.getInsertSql(parent);
            }
            lib.freeExec(sql).then(function(result) {
                if (common.isEmpty(result.error)){
                    if (common.isEmpty(obj.children)){
                        d.resolve({
                            err:null,
                            result:result
                        });
                    }else{
                        var children;
                        sql = "";
                        for (var x = 0 ; x<obj.children.length ; x++){
                            children = obj.children[x];
                            sql += lib.getDeleteBeforeInsertSql(children)+lib.getInsertSql(children);
                        }
                        lib.freeExec(sql).then(function(childrenExists) {
                            d.resolve({
                                err:null,
                                result:result
                            });
                        });
                    }
                }else{
                    d.resolve({
                        err:err,
                        result:[]
                    });
                }

            });

        });

        return d.promise;

    }
};

module.exports = lib;