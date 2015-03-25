var q = require("q");
var common = require("../libs/common");
var conn = common.getLib('conn');

var validate   = common.getLib('validate');

module.exports = function(repository, request) {
    //var globalRepository = common.getRepository("global")(feature);

    var controller =  {
        create_interceptor: function () {
            var d = new q.defer();
          controller.checkPlan(request).then(function(planResponse){
                controller.checkUser(planResponse).then(function(userResponse){

                    d.resolve(userResponse);
                });

            });
            return d.promise;

        },
        checkPlan : function(){
            var d = new q.defer();
            if (common.isEmpty(request.data.plan)){
                var planController = common.getController("plan");
                planController.getOne({field:"description",value:"basics"}).then(function(planResponse){
                    request.data.plan = planResponse.data.uuid;
                    d.resolve(request);
                });
            }else{
                d.resolve(request);
            }

            return d.promise;
        },
        checkUser : function(){
            var d = new q.defer();
            if (common.isEmpty(request.data.user)){
                var user = {};
                user.uuid = request.user.uuid;

                var profileController = common.getController("profile");

                profileController.getOne(common.getDefaultProfile()).then(function(profileResponse){
                    user.profile = profileResponse.data.uuid;
                    request.data.user = user;
                    d.resolve(request);
                });
            }else{
                d.resolve(request);
            }

            return d.promise;
        },
        getAttributeGroup2: function (){
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
        }

    };
    return controller;
}
