var q = require("q");
var conn = require('../shared/conn');
var bcrypt   = require('bcrypt-nodejs');

module.exports = function(feature) {
    return {
        getOne: function (search) {

            var d = new q.defer();

            var queryBuilder = {
                table: feature,
                filters: search
            };

            conn.query(queryBuilder).then(function (featureDataSet) {
                if (featureDataSet.rows.length > 0) {

                    var obj = featureDataSet.rows[0];

                    var queryBuilder = {
                        table: feature + "_attribute",
                        filters: search
                    };
                    conn.query(queryBuilder).then(function (AttributeDataSet) {
                        if (dataSet.rows.length > 0) {

                            obj = dataSet.rows[0];



                            d.resolve(dataSet.rows[0]);
                        } else {
                            d.resolve(null);
                        }
                    });

                    d.resolve(dataSet.rows[0]);
                } else {
                    d.resolve(null);
                }
            });

            return d.promise;

        },
        exists: function (search) {
            var d = new q.defer();

            if (typeof(search)=="string"){
                search = {field:"uuid",value:search};
            }

            var queryBuilder = {
                table: feature,
                filters: search
            };
            conn.query(queryBuilder).then(function (featureDataSet) {
                d.resolve(featureDataSet.rows.length > 0);
            });

            return d.promise;
        }
    }
}