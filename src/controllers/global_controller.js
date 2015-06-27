var q = require("q");
var common = require("../libs/common");

var validate   = common.getLib('validate');

module.exports = function(feature, repository, request) {
    //var globalRepository = common.getRepository("global")(feature);

    return {
        getAll: function () {
            var d = new q.defer();

            var queryBuilder = {
                table: feature
            };

            repository.getAll(queryBuilder).then(function (featureDataSet) {
                if (featureDataSet.rows.length > 0) {

                    d.resolve(common.getResultObj(featureDataSet.rows));

                } else {
                    d.resolve(common.getErrorObj("not_found"));
                }
            });

            return d.promise;
        },
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
        getOneById: function (uuid) {
            var d = new q.defer();
            uuid = common.isEmpty(uuid) ? request.params.uuid : uuid;
            var ct = -1;
            var old_uuid = "";
            var arr = [];
            var group, description, value;

            repository.getOne(uuid).then(function(dataSet){
                if (dataSet.rows.length>0){

                  for (var x = 0; x < dataSet.rows.length; x++) {
                      group = dataSet.rows[x].attribute_group;
                      description = dataSet.rows[x].attribute_description;
                      value = dataSet.rows[x].attribute_value;
                      if (dataSet.rows[x].uuid != old_uuid) {
                          ct++;
                          old_uuid = dataSet.rows[x].uuid;
                          arr[ct] = dataSet.rows[x];
                          delete arr[ct].attribute_group;
                          delete arr[ct].attribute_description;
                          delete arr[ct].attribute_value;
                          arr[ct].attributes = {};
                      }
                      if (!arr[ct].attributes[group]) {
                          arr[ct].attributes[group] = {};
                      }

                      arr[ct].attributes[group][description] = value;

                  }
                  d.resolve(common.getResultObj(arr));


                }else{
                    d.resolve(common.getResultObj([]));
                }
            });
            return d.promise;
        },
        find: function () {
            var d = new q.defer();

            var data = request.data;

            if (typeof(data)=="string"){
                data = {uuid:data};
            }

            repository.find(data).then(function (featureDataSet) {
                if (common.isError(featureDataSet)){
                    d.resolve(common.getErrorObj("find_"+feature));
                }else{
                    d.resolve(common.getResultObj(featureDataSet.rows));
                }
            });

            return d.promise;

        },
        save: function (mode) {
            var d = new q.defer();

            mode = common.isEmpty(mode) ? "save" : mode;

            this.interceptor(mode).then(function(request){
                if (common.isError(request)){
                    d.resolve(request);
                }else{
                    var data = request.data;
                    var arr = common.turnToArray(data);

                    var arrUuids = [];
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
	                                arrUuids.push(saveResult);
                                    if (arrUuids.length==arr.length){
                                        d.resolve(common.getResultObj({uuid:arrUuids}));
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
        interceptor: function (interceptor){
            var d = new q.defer();
            interceptor += "_interceptor";

            if (common.isEmpty(this[interceptor])){
                d.resolve(request);
            }else{
                this[interceptor](request).then(function(interceptedData){
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
        getAllByFeature: function (feature_name, feature_uuid){
            var d = new q.defer();

            feature_name = common.isEmpty(feature_name) ? request.params.feature_name : feature_name;
            feature_uuid = common.isEmpty(feature_uuid) ? request.params.feature_uuid : feature_uuid;

            repository.getAllByFeature(feature_name, feature_uuid).then(function(dataSet){
                if (common.isError(dataSet)){
                    d.resolve(common.getErrorObj("find_" + feature));
                }else{
                    d.resolve(common.getResultObj(dataSet.data));
                }

            });

            return d.promise;
        },
        getAllByUser: function (uuid){
            var d = new q.defer();

            uuid = common.isEmpty(uuid) ? request.user.uuid : uuid;

            var attributeController = common.getController("attribute");
            attributeController.getAttributeValueGroupByUserFeature(uuid, feature).then(function(dataSet){
                if (common.isError(dataSet)){
                    d.resolve(common.getErrorObj("find_" + feature));
                }else{
                    d.resolve(common.getResultObj(dataSet.data));
                }

            });

            return d.promise;
        },
        getAllByCompany: function (uuid){
            var d = new q.defer();
            uuid = common.isEmpty(uuid) ? request.user.company : uuid;
            repository.getAllByCompany(uuid).then(function(dataSet){
                if (common.isError(dataSet)){
                    d.resolve(common.getErrorObj("find_" + feature));
                }else{
                    d.resolve(common.getResultObj(dataSet.data));
                }

            });

            return d.promise;
        },
	    getAllByPerson: function (uuid){
		    var d = new q.defer();
		    uuid = common.isEmpty(uuid) ? request.params.uuid : uuid;
		    repository.getAllByPerson(uuid).then(function(dataSet){
			    if (common.isError(dataSet)){
				    d.resolve(common.getErrorObj("find_" + feature));
			    }else{
				    d.resolve(common.getResultObj(dataSet.data));
			    }

		    });

		    return d.promise;
	    },
        getAllByFilteredAttributes: function (){
            var d = new q.defer();

            repository.getAllByFilteredAttributes(request.data).then(function(dataSet){
                if (common.isError(dataSet)){
                    d.resolve(common.getErrorObj("find_" + feature));
                }else{
                    if(dataSet.rows.length>0){
                        var arrDataSet = common.turnToArray(dataSet.rows);
                        var attributeController = common.getController("attribute");

                        attributeController.getAttributeValueGroupByFeatureCollection(feature, arrDataSet).then(function(obj){

                            if(common.isError(obj)){
                                d.resolve(common.getErrorObj("find_" + feature + "_attributes"));
                            }else{
                                d.resolve(common.getResultObj(obj.data));
                            }
                        });
                    }
                    else{
                        d.resolve(common.getResultObj([]));
                    }
                }
            });

            return d.promise;
        }
    }
};
