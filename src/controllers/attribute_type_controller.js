var q = require("q");
var common = require("../libs/common");
module.exports = function(repository, request){
    return {
        getAllAsDict: function () {

            var d = new q.defer();

            repository.getAllAsDict().then(function(dataSet){
                if (common.isError(dataSet)){
                    d.resolve(common.getErrorObj("find_attribute_type"));
                }else{

                    repository.getAllOptionsAsDict().then(function(dataSetOptions){
                        var optionsDict = {};
                        for (var x=0; x<dataSetOptions.rows.length ; x++){
                            if (common.isEmpty(optionsDict[dataSetOptions.rows[x].attribute_type_uuid])){
                                optionsDict[dataSetOptions.rows[x].attribute_type_uuid] = [];
                            }
                            optionsDict[dataSetOptions.rows[x].attribute_type_uuid].push(dataSetOptions.rows[x]);
                        }

                        var attributeTypeDict = {};
                        for (var x=0; x<dataSet.rows.length ; x++){
                            attributeTypeDict[dataSet.rows[x].uuid] = dataSet.rows[x];
                            if (!common.isEmpty(optionsDict[dataSet.rows[x].uuid])){
                                attributeTypeDict[dataSet.rows[x].uuid].options = optionsDict[dataSet.rows[x].uuid];
                            }
                        }
                        d.resolve(common.getResultObj(attributeTypeDict));
                    });

                }
            });

            return d.promise;
        }
    }

};





