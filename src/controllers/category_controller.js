var q = require("q");
var common = require("../libs/common");

module.exports = function (repository, request) {
    var controller = {
        find: function () {
            var d = new q.defer();

            var controller = common.getController("category",request);

            d.resolve(controller.getAllByCompany());

            return d.promise;
        },
        delete : function(){
            var d = new q.defer();

            repository.delete(request.params.uuid).then(function(dataSet){
                if(common.isError(dataSet)){
                    d.resolve(common.getErrorObj("person_delete_failed"));
                }
                else{
                    d.resolve(common.getResultObj(dataSet));
                }
            });

            return d.promise;
        }
    };
    return controller;
};

