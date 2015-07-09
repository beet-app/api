var q = require("q");
var common = require("../libs/common");

module.exports = function (repository, request) {
    var controller = {
        getByExam: function (uuid){
            var d = new q.defer();
            uuid = common.isEmpty(uuid) ? request.params.uuid : uuid;
            var ct = -1;
            var old_uuid = "";
            var arr = [];
            var group, description, value;

            repository.getByExam(uuid).then(function(dataSet){
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
        save:function(mode){
            var d = new q.defer();
            var candidate = request.data;
            var exam_uuid = candidate.exam;
            delete  candidate.exam;
            var mode = common.isEmpty(mode) ? "save" : mode;

            repository.save(candidate, mode).then(function(saveResult){
                if (common.isError(saveResult)){
                    d.resolve(common.getErrorObj(mode + "_" + feature));
                }else{
                    var candidate_uuid = saveResult;

                    var obj = {
                        candidate_uuid:candidate_uuid,
                        exam_uuid:exam_uuid
                    };

                    var examController = common.getController("exam",request);
                    examController.saveDetail(obj).then(function(detailResponse){
                        if (common.isError(detailResponse)){
                            d.resolve(common.getErrorObj("save_exam_detail"));
                        }else{
                            d.resolve(common.getSuccessObj());
                        }
                    });

                }
            });

            return d.promise;
        }
    };
    return controller;
};



