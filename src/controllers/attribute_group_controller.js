var q = require("q");
var common = require("../libs/common");
module.exports = function(repository){
    return {
        getGroupByFeature: function (feature_uuid) {

            var d = new q.defer();

            repository.getGroupByFeature(feature_uuid).then(function(dataSet){
                if (common.isError(dataSet)){
                    d.resolve(common.getErrorObj("find_attribute_group"));
                }else{
                    d.resolve(common.getResultObj(dataSet));
                }
            });

            return d.promise;
        }
    }
};