var q = require("q");
var conn = require('../shared/conn');

module.exports = {
  getByUser: function (user_uuid) {
    var d = new q.defer();

    var query = "select company_uuid from user_company where user_uuid='"+user_uuid+"'";
    var obj = {};
    var arr = [];
    conn.freeQuery(query).then(function (dataSet) {
      if (dataSet.rows.length > 0) {

        for (var x = 0; x < dataSet.rows.length; x++) {
          var companyController = require("./global")("company");
          companyController.getOne(dataSet.rows[x].company_uuid).then(function(company){
            arr.push(company);
            if (dataSet.rows.length == arr.length){
              d.resolve(arr);
            }

          });

        }
      } else {
        d.resolve(null);
      }
    });

    return d.promise;
  }
}




