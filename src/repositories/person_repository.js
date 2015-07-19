var q = require("q");
var common = require("../libs/common");
var conn = common.getLib('conn');

module.exports = {
    delete: function (uuid) {
        var d = new q.defer();

        var query = "";
        query += " update person";
        query += " set deleted = 1";
        query += " where uuid = '" + uuid + "'";

        conn.query(query).then(function(dataSet){
            d.resolve(dataSet);
        });

        return d.promise;
    }
};