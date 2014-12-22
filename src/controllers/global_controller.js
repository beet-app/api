var q = require("q");
var common = require("../libs/common");

var validate   = common.getLib('validate');

module.exports = function(feature, repository) {
    //var globalRepository = common.getRepository("global")(feature);

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

            repository.getOne(queryBuilder).then(function (featureDataSet) {
                if (featureDataSet.rows.length > 0) {

                    var obj = featureDataSet.rows[0];

                    var attributeController = common.getController("attribute");
                    attributeController.getAttributeValueGroupByFeature(feature, obj.uuid).then(function(attributesDataSet){
                        if (common.isError(attributesDataSet)){
                            d.resolve(common.getErrorObj(attributesDataSet));
                        }else{
                            obj.attributes = attributesDataSet.data;
                        }
                        d.resolve(common.getResultObj(obj));
                    });
                } else {
                    d.resolve(common.getErrorObj("not_found"));
                }
            });

            return d.promise;

        },
        save: function (request, mode) {
            var d = new q.defer();

            mode = common.isEmpty(mode) ? "save" : mode;

            this.interceptor(mode, request).then(function(request){
                if (common.isError(request)){
                    d.resolve(request);
                }else{
                    var data = request.data;
                    var arr = common.turnToArray(data);
                    var ct = 0;
                    for(var key in arr){
                        var validateObj = validate.validate(arr[key]);

                        if (common.isError(validateObj)){
                            d.resolve(common.getErrorObj("invalid"));
                            break;
                        }else{

                            repository.save(arr[key], mode).then(function(saveResult){
                                if (common.isError(saveResult)){
                                    d.resolve(common.getErrorObj(mode + "_" + feature));
                                }else{
                                    ct++;
                                    if (ct==arr.length){
                                        d.resolve(common.getSuccessObj());
                                    }
                                }
                            });

                        }

                    }
                }
            });

            return d.promise;



        },
        /*
         exists: function (search) {
         var d = new q.defer();

         if (typeof(search)=="string"){
         search = {field:"uuid",value:search};
         }

         var queryBuilder = {
         table: feature,
         filters: search
         };
         conn.find(queryBuilder).then(function (featureDataSet) {
         d.resolve(featureDataSet.rows.length > 0);
         });

         return d.promise;
         },
         */
        interceptor: function (interceptor, data){
            var d = new q.defer();
            interceptor += "_interceptor";
            if (common.isEmpty(this[interceptor])){
                d.resolve(data);
            }else{
                this[interceptor](data).then(function(interceptedData){
                    //common.log(interceptedData);
                    d.resolve(interceptedData);
                });
            }

            return d.promise;
        },
        getAttributeGroup: function (){
            var d = new q.defer();

            var attributeController = common.getController("attribute");
            attributeController.getAttributeGroupByFeature(feature).then(function(dataSet){
                if (common.isError(dataSet)){
                    d.resolve(common.getErrorObj("find_" + feature + "_attribute"));
                }else{
                    d.resolve(common.getResultObj(dataSet.data));
                }
            });

            return d.promise;
        },
        getAllByUser: function (user_uuid){
            var d = new q.defer();

            var attributeController = common.getController("attribute");
            attributeController.getAttributeValueGroupByUserFeature(user_uuid, feature).then(function(dataSet){
                if (common.isError(dataSet)){
                    d.resolve(common.getErrorObj("find_" + feature));
                }else{
                    d.resolve(common.getResultObj(dataSet.data));
                }

            });

            return d.promise;
        }


    }
}
