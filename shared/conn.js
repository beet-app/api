var mysql = require('mysql');
var config = require('../config/database');
var q = require("q");
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




    }

};