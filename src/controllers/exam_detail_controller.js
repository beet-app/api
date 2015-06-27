var q = require("q");
var common = require("../libs/common");

module.exports = function (repository, request) {
    var controller = {
        getAllByFeature: function (feature_name, feature_uuid){
            var d = new q.defer();

            var feature_name = common.isEmpty(feature_name) ? request.params.feature_name : feature_name;
            var feature_uuid = common.isEmpty(feature_uuid) ? request.params.feature_uuid : feature_uuid;
        
            repository.getAllByFeature(feature_name, feature_uuid).then(function(dataSet){
                if (common.isError(dataSet)){
                    d.resolve(common.getErrorObj("find_" + feature));
                }else{
                    console.log(dataSet);

                }

            });

            return d.promise;
        }
    };
    return controller;
};

