var q = require("q");
var common = require("../libs/common");

module.exports = function (repository, request) {
    var controller = {
        find: function () {
            var d = new q.defer();

            var controller = common.getController("exam", request);

            d.resolve(controller.getAllByCompany());

            return d.promise;
        },
        saveDetail : function(obj){
            var d = new q.defer();

            repository.saveDetail(obj).then(function(saveResult){
                if (common.isError(saveResult)){
                    d.resolve(common.getErrorObj("save_exam_detail"));
                }else{
                    d.resolve(common.getResultObj(saveResult));
                }
            });
            return d.promise;
        }
    };
    return controller;
};