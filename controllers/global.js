var q = require("q");
var conn = require('../shared/conn');
var bcrypt   = require('bcrypt-nodejs');
var common   = require('../shared/common');
var validate   = require('../shared/validate');

module.exports = function(feature) {
    var globalRepository = require("../repositories/globalRepository");

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
        save: function (data) {

            var d = new q.defer();
            var validateObj;
            var arr = Common.turnToArray(data);
            var ct = 0;
            for(var key in arr){

                validateObj = validate.validate(arr[key]);

                if (common.isEmpty(validateObj.error)){
                  globalRepository.save(arr[key]).then(function(result){
                    ct++;
                    if (ct==arr.length){
                      d.resolve(result);
                    }

                  });
                }else{
                  d.resolve(common.getErrorObj("invalid"));
                  break;
                }

            }

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
