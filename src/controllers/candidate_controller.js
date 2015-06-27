var q = require("q");
var common = require("../libs/common");

module.exports = function (repository, request) {
    var controller = {
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



