var q = require("q");
var common = require("../libs/common");
var driver = require("../libs/driver_mysql");

var lib = {
    query: function (query) {
        var d = new q.defer();
        driver.query(query).then(function(data){
            var obj = lib.getQueryReturnObject(data.error, data.rows, data.fields);
            common.logQuery(query, obj);
            d.resolve(obj);
        });
        return d.promise;
    },
    exec: function (query) {
        var d = new q.defer();
        driver.exec(query).then(function(data){
            var obj = lib.getExecReturnObject(data.error, data.result);
            common.logQuery(query, obj);
            d.resolve(obj);
        });
        return d.promise;
    },
    find: function (queryBuilder) {


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

        connection.query(query, function(err, rows, fields) {
            d.resolve({
                err:err,
                rows:err===null ? rows : [],
                fields:fields
            });
        });


        return d.promise;

    },
    save: function (obj) {

        var d = new q.defer();

        var parent = (obj.parent) ? obj.parent : obj;

        lib.exists(parent).then(function(parentExists) {
            if (common.isEmpty(parentExists.error)){

                var sql = (parentExists.result) ? lib.getUpdateSql(parent) : lib.getInsertSql(parent);

                lib.exec(sql).then(function(parentExec) {
                    if (common.isEmpty(parentExec.error)){
                        if (common.isEmpty(obj.children)){
                            d.resolve(parentExec);
                        }else{
                            sql = "";
                            for (var x = 0 ; x<obj.children.length ; x++){
                                sql += lib.getDeleteBeforeInsertSql(obj.children[x])+lib.getInsertSql(obj.children[x]);
                            }
                            lib.exec(sql).then(function(noUseForWhile) {
                                d.resolve(parentExec);
                            });
                        }
                    }else{
                        d.resolve(parentExec);
                    }
                });
            }else{
                d.resolve(parentExists);
            }
        });

        return d.promise;

    },
    exists: function (obj) {
        var d = new q.defer();
        lib.query(lib.getExistsSql(obj)).then(function(parentExists) {
            if (common.isEmpty(parentExists.error)){
                d.resolve({result:(parentExists.result.rows.length > 0)});
            }else{
                d.resolve(parentExists);
            }
        });
        return d.promise;
    },
    getQueryReturnObject: function (error, rows, fields) {
        var obj = {};

        if (!common.isEmpty(error)){
            obj.error = error;
        }
        if (!common.isEmpty(rows) || !common.isEmpty(fields)){
            obj.result = {};
            if (!common.isEmpty(rows)){
                obj.result.rows = rows;
            }
            if (!common.isEmpty(fields)){
                obj.result.fields = fields;
            }
        }
        return obj;
    },
    getExecReturnObject: function (error, result) {
        var obj = {};

        if (!common.isEmpty(error)){
            obj.error = error;
        }
        if (!common.isEmpty(result)){
            obj.result = result;
        }
        return obj;
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
            var fields = obj.indexes[0] + "=" + obj.indexes[0];
            var where = "";
            for (var key in arr[x]){
                if (!common.inArray(key, obj.indexes)){
                    fields += ","+key+"='"+arr[x][key]+"'";
                }
            }
            for (var key in obj.indexes){
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
};

module.exports = lib;