var q = require("q");
var common = require("../libs/common");
var conn = common.getLib('conn');
var bcrypt   = require('bcrypt-nodejs');

var validate   = common.getLib('validate');

module.exports = function(feature) {
    var schema = common.getLib('schema')(feature);
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

                    var attributeController = common.getController("attribute");
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

        saveRelative: function (uuid, relative) {

          var d = new q.defer();
          var value;
          var sql = "";

          for (var key in relative.values){
            value = attributes[group][attribute];
            sql += "INSERT INTO "+relative.table+" ("+feature+"_uuid, "+relative.index+") values ('"+uuid+"','"+relative.values[key]+"');";
          }
          conn.freeExec(sql).then(function(result){
            d.resolve(result);
          });

          return d.promise;

        },
        save: function (obj) {

            var d = new q.defer();


            var key;
            var relative;
            var aux = {};
            var main = {};

            obj = schema.getSaveObj(obj);

            conn.save(obj).then(function(mainResult){

                d.resolve(mainResult);

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

            var attributeController = common.getController("attribute");
            attributeController.getAttributeGroupByFeature(feature).then(function(obj){
                d.resolve(common.getResultObj(obj.data));
            });

            return d.promise;
        },
        getAllByUser: function (user_uuid){
          var d = new q.defer();

          var attributeController = common.getController("attribute");
          attributeController.getAttributeValueGroupByUserFeature(user_uuid, feature).then(function(obj){
            d.resolve(common.getResultObj(obj.data));
          });

          return d.promise;
        }


    }
}
