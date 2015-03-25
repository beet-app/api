var q = require("q");
var common = require("../libs/common");
var conn = common.getLib('conn');

module.exports = {
    getAllAsDict: function () {

      var d = new q.defer();

      conn.query("select at.*,atm.description 'template' from attribute_type at inner join attribute_template atm on atm.uuid=at.attribute_template_uuid").then(function(dataSet){
          d.resolve(dataSet);
      });

      return d.promise;
    },
    getAllOptionsAsDict: function () {

        var d = new q.defer();

        conn.query("select * from attribute_type_option").then(function(dataSet){
            d.resolve(dataSet);
        });

        return d.promise;
    }




};


