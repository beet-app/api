var mysql = require('mysql');
var q = require("q");
var common = require("../libs/common");
var config = common.getConfig('database');
module.exports = {
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





        console.log(query);
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
        console.log(query);
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
    freeExec: function (query) {
        var d = new q.defer();

        var connection = mysql.createConnection(config);
        connection.connect();
        console.log(query);
        connection.query(query, function(err, result) {
            d.resolve({
                err:err,
                result:err===null ? result : []
            });
        });

        connection.end();

        return d.promise;




    },
    getInsertSql: function (obj) {
        var fields = "";
        var values = "";

        for (key in obj.fields) {
            fields += (fields == "") ? key : "," + key;
            values += (values == "") ? "'" + obj.fields[key] + "'" : ",'" + obj.fields[key] + "'";
        }

        return "INSERT INTO " + obj.table + " (" + fields + ") VALUES (" + values + ");";
    },
    getUpdateSql: function (obj) {
        var fields = "";
        var where = "";
        for (key in obj.fields){
            fields += (fields=="") ? key+"='"+obj.fields[key]+"'" : ","+key+"='"+obj.fields[key]+"'";
        }
        for (key in obj.indexes){
            where += (where=="") ? obj.indexes[key]+"='"+obj.fields[obj.indexes[key]]+"'" : ","+obj.indexes[key]+"='"+obj.fields[obj.indexes[key]]+"'";
        }

        return "UPDATE " + obj.table + " SET " + sql + " WHERE " + where;

    },
    getExistsSql: function (obj) {
        var fields = "";
        var where = "";
        for (var key in obj.indexes){
            fields += (fields=="") ? obj.indexes[key] : ","+obj.indexes[key];
            where += (where=="") ? obj.indexes[key]+"='"+obj.fields[obj.indexes[key]]+"'" : ","+obj.indexes[key]+"='"+obj.fields[obj.indexes[key]]+"'";
        }

        return "SELECT " + fields + " FROM " + obj.table + " WHERE " + where;

    },
    save: function (obj) {
        var d = new q.defer();

        var connection = mysql.createConnection(config);
        var getUpdateSql = this.getUpdateSql;
        var getInsertSql = this.getInsertSql;
        var getExistsSql = this.getExistsSql;
        connection.connect();

        var parent = (obj.parent) ? obj.parent : obj;

        var sql = "";

        connection.query(getExistsSql(parent), function(errExists, parentExists) {
            console.log(errExists);
            if (parentExists.length > 0){
                sql = getUpdateSql(parent);
            }else{
                sql = getInsertSql(parent);
            }
            console.log(sql);

            //connection.query(sql, function(err, result) {

                if (common.isEmpty(errExists)){
                    if (common.isEmpty(obj.children)){
                        d.resolve({
                            err:null,
                            result:result
                        });
                    }else{
                        var children;
                        var ct=0;
                        for (var key in obj.children){
                            children = obj.children[key];
                            console.log(children);
                            connection.query(getExistsSql(children), function(errExists, childrenExists) {
                                if (childrenExists.length > 0){
                                    sql = getUpdateSql(children);
                                }else{
                                    sql = getInsertSql(children);
                                }
                                console.log(sql);
                                connection.quer(sql, function(err, childrenResult) {
                                    ct++;
                                });
                            });

                            if (ct==obj.children.length){
                                d.resolve({
                                    err:null,
                                    result:result
                                });
                            }
                        }
                    }
                }else{
                    d.resolve({
                        err:err,
                        result:[]
                    });
                }

            //});

        });

        connection.end();

        return d.promise;

    }
};
