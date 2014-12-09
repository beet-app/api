var q = require("q");
var conn = require('../shared/conn');
var common = require('../shared/common');

module.exports = {
  getByUser: function (user_uuid) {
    var d = new q.defer();

    var companyController = require("./global")("company");
    companyController.getAllByUser(user_uuid).then(function(companies){
      d.resolve(common.getResultObj(companies));
    });

    return d.promise;
  }
}




