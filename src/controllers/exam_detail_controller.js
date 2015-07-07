var q = require("q");
var common = require("../libs/common");

module.exports = function (repository, request) {
    var controller = {
        getAllByFeature: function (feature_name, feature_uuid){
            var d = new q.defer();

            feature_name = common.isEmpty(feature_name) ? request.params.feature_name : feature_name;
            feature_uuid = common.isEmpty(feature_uuid) ? request.params.feature_uuid : feature_uuid;
        
            repository.getAllByFeature(feature_name, feature_uuid).then(function(dataSet){
                if (common.isError(dataSet)){
                    d.resolve(common.getErrorObj("find_" + feature));
                }else{
                    arrDetails = dataSet.data;
                    if (arrDetails.length>0){
                        var ct = 0;
                        var objCandidatesDict = {};
                        var candidateController = common.getController("candidate", request);
                        for (var x=0 ; x<arrDetails.length ; x++){
                            candidateController.getOneById(arrDetails[x].candidate_uuid).then(function(candidateData){
                                var candidate = candidateData.data[0];
                                ct++;
                                objCandidatesDict[candidate.uuid] = candidate;
                                if (ct==arrDetails.length){
                                    for (var y=0 ; y<arrDetails.length ; y++){
                                        arrDetails[y].candidate = objCandidatesDict[arrDetails[y].candidate_uuid];
                                        delete arrDetails[y].candidate_uuid;
                                    }
                                    d.resolve(common.getResultObj(arrDetails));
                                }
                            });
                        }
                    }else{
                        d.resolve(common.getResultObj([]]));
                    }



                }

            });

            return d.promise;
        }
    };
    return controller;
};

