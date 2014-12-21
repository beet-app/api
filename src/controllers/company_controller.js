var q = require("q");
var common = require("../libs/common");
var conn = common.getLib('conn');

var validate   = common.getLib('validate');

module.exports = function(repository) {
    //var globalRepository = common.getRepository("global")(feature);

    return {
        save_interceptor: function (data) {
          var d = new q.defer();
          this.checkPlan(data).then(function(data){
            this.checkUser(data).then(function(data){

            });
          });
          return d.promise;

        },
        checkPlan : function(data){
          var d = new q.defer();
          if (common.isEmpty(data.plan)){
            var planController = common.getController("plan");
            planController.getOne({field:"description",value:"basics"}).then(function(planResponse){
              data.plan = planResponse.data.uuid;
              d.resolve(data);
            });
          }else{
            d.resolve(data);
          }

          return d.promise;
        }

    }
}
