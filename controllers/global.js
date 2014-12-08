var q = require("q");
var conn = require('../shared/conn');
var bcrypt   = require('bcrypt-nodejs');

module.exports = function(feature) {
    return {
        getOne: function (search) {

            var d = new q.defer();

            if (typeof(search)=="string"){
                search = {field:"uuid",value:search};
            }

            var queryBuilder = {
                table: feature,
                filters: search
            };

            conn.query(queryBuilder).then(function (featureDataSet) {
                if (featureDataSet.rows.length > 0) {

                    var obj = featureDataSet.rows[0];

                    var attributeController = require("./attribute");
                    attributeController.getAttributeValueGroupByFeature(feature, obj.uuid).then(function(attributes){
                        if (attributes!==null){
                            obj.attributes = attributes;
                        }
                        d.resolve(obj);
                    });
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
        },
        getAttributeGroup: function (){
            var d = new q.defer();

            var attributeController = require("./attribute");
            attributeController.getAttributeGroupByFeature(feature).then(function(obj){
                d.resolve(obj);
            });

            return d.promise;
        }
    }
}