var mysql = require('mysql');
var config = require('../../config/database');
var q = require("q");
module.exports = {
    query: function (queryBuilder) {
        var connection = mysql.createConnection(config);

        connection.connect();

        var x, value;
        var d = new q.defer();
        
        var arrFields = queryBuilder.fields;
        var arrFilters = queryBuilder.filters;
        

        
        var fields = "";
        for (x=0;x<arrFields.length;x++){
            fields += (fields=="") ? arrFields[x] : "," + arrFields[x];
        }

        var where = "";
        for (x=0;x<arrFilters.length;x++){

            value = connection.escape(arrFilters[x].value);
            console.log(value);
            where += (where=="") ? arrFilters[x].field+"="+value+"" : " AND " + arrFilters[x].field+"="+value+"";
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




    }

};