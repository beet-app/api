var q = require("q");
var common = require("../libs/common");

var attributeTypeRepository = common.getRepository("global")("attribute_type");
module.exports = {
    getAllAsDict: function () {

        var d = new q.defer();

        attributeTypeRepository.query("select at.*,atm.description 'template' from attribute_type at inner join attribute_template atm on atm.uuid=at.attribute_template_uuid").then(function(dataSet){

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
};




