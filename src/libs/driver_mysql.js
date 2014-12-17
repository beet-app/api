var mysql = require('mysql');
var q = require("q");
var common = require("../libs/common");
var config = common.getConfig('database');

var debug=false;

var lib = {
    query: function (query) {
        var d = new q.defer();

        if (debug){
            d.resolve({error:null, rows:{}, fields:{}});
        }else{
            var connection = mysql.createConnection(config);

            connection.connect();
            common.log(query);
            connection.query(query, function(error, rows, fields) {
                connection.end();
                d.resolve({error:error, rows:rows, fields:fields});
            });
        }

        return d.promise;

    },
    exec: function (query) {
        var d = new q.defer();

        if (debug){
            d.resolve({error:null, result:{}});
        }else{
            var connection = mysql.createConnection(config);

            connection.connect();

            connection.query(query, function(error, result) {
                var arrResult = common.turnToArray(result);
                //for (var x=0 ; x<arrResult.length ; x++){
                    connection.end();
                    d.resolve({error:error, result:arrResult[0]});
                //}

            });
        }

        return d.promise;
    },
    escape: function (str) {
        return mysql.createConnection(config).escape(str);
    }
};

module.exports = lib;