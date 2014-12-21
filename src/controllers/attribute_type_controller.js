var q = require("q");
var common = require("../libs/common");
module.exports = function(repository){
  return {
    getAllAsDict: function () {

      var d = new q.defer();

      repository.getAllAsDict().then(function(dataSet){
        if (common.isError(dataSet)){
          d.resolve(common.getErrorObj("find_attribute_type"));
        }else{
          var attributeTypeDict = {};
          for (var x=0; x<dataSet.rows.length ; x++){
            attributeTypeDict[dataSet.rows[x].uuid] = dataSet.rows[x];
          }
          d.resolve(common.getResultObj(attributeTypeDict));
        }
      });

      return d.promise;
    }
  }

};





