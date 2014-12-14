var q = require("q");
var conn = require('../shared/conn');
var bcrypt   = require('bcrypt-nodejs');
var common   = require('../shared/common');

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
        getAllByUserDEPRECATED: function (search) {

            var d = new q.defer();

            if (typeof(search)=="string"){
                search = {field:"uuid",value:search};
            }

            var queryBuilder = {
                table: feature,
                filters: search
            };
            var arr = [];
            var arrUuids = [];
            conn.freeQuery("SELECT * FROM COMPANY WHERE uuid IN (select company_uuid from user_company where user_uuid='"+search.value+"') order by uuid").then(function (featureDataSet) {
                if (featureDataSet.rows.length > 0) {
                    /*
                    for (var x = 0 ; x<featureDataSet.rows.length ; x++){
                        arrUuids.push(featureDataSet.rows(x).uuid);
                        arr.push(featureDataSet.rows(x).uuid);
                    }
                    var obj = featureDataSet.rows[0];
                    */
                    var attributeController = require("./attribute");
                    attributeController.getAttributeValueGroupByFeatureCollection(feature, featureDataSet.rows).then(function(data){
                        d.resolve(data);
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
                d.resolve(common.getResultObj(obj.data));
            });

            return d.promise;
        },
        getAllByUser: function (user_uuid){
          var d = new q.defer();

          var attributeController = require("./attribute");
          attributeController.getAttributeValueGroupByUserFeature(user_uuid, feature).then(function(obj){
            d.resolve(common.getResultObj(obj.data));
          });

          return d.promise;
        }


    }
}
