var q = require("q");
var conn = require('../shared/conn');
module.exports = {
    // use mongoose to get all menus in the database
    getAllAsDict: function () {

        var d = new q.defer();


        conn.freeQuery("select at.*,atm.description 'template' from attribute_type at inner join attribute_template atm on atm.uuid=at.attribute_template_uuid").then(function(dataSet){
            if (dataSet.rows.length>0){
                var attributeTypeDict = {};
                for (var x=0; x<dataSet.rows.length ; x++){
                    attributeTypeDict[dataSet.rows[x].uuid] = dataSet.rows[x];
                }
                d.resolve(attributeTypeDict);
            }else{
                d.resolve(null);
            }
        });

        return d.promise;
    }
};




