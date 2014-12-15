var q = require("q");
var conn = require('../shared/conn');
var bcrypt   = require('bcrypt-nodejs');
var common   = require('../shared/common');
var validate   = require('../shared/validate');

module.exports = function(feature) {
    var globalRepository = {
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
        saveAttributes: function (uuid, attributes) {

          var d = new q.defer();
          var value;
          var sql = "";
          var main = {};
          for (var group in attributes){
            for (var attribute in attributes[group]){
              value = attributes[group][attribute];
              sql += "INSERT INTO " + feature + "_attribute ("+feature+"_uuid, attribute_uuid, value) values ('"+uuid+"','"+attribute+"','"+value+"');";
            }
          }
          conn.freeExec(sql).then(function(result){
            d.resolve(result);
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
            for (key in obj){
              if (common.isObject(obj[key])){
                aux[key] = obj[key];
              }else{
                main = obj[key];
              }
            }

            if (common.isEmpty(main.uuid)){
              main.uuid = common.generateUUID();
            }

            conn.save(main).then(function(mainResult){

              var ctAux = 0;
              for (key in aux){
                if (key==="attributes"){
                  globalRepository.saveAttributes(main.uuid, aux[key]).then(function(resultAttributes){
                    ctAux++;
                  });
                }else{
                  relative = {
                    table:key,
                    index:key.replace("_"+feature, "").replace(feature+"_", "")+"_uuid",
                    values:aux[key]
                  };
                  globalRepository.saveRelative(main.uuid, relative).then(function(resultRelatives){
                    ctAux++;
                  });
                }
                if (ctAux==aux.length){
                  d.resolve(mainResult);
                }
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
    return module;
}
