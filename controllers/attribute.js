var q = require("q");
var conn = require('../shared/conn');
var attributeTypeController = require('./attribute_type');
module.exports = {
    // use mongoose to get all menus in the database
    getAttributeGroupByFeature: function (feature) {

        var d = new q.defer();


        attributeTypeController.getAllAsDict().then(function(attributeTypeDict){
            var query = "";
            query += " select";
            query += " ag.description 'group', a.description, a.order, a.size, a.required";
            query += " from attribute a";
            query += " inner join attribute_group ag on a.attribute_group_uuid=ag.uuid";
            query += " inner join attribute_group_feature agf on ag.uuid=agf.attribute_group_uuid";
            query += " inner join feature f on f.uuid=agf.feature_uuid and f.description='"+feature+"'";
            query += " order by ag.description, a.order";

            /*
            [
                {
                    "person_data":[
                        {
                            uuid:""
                        }
                    ]
                }
            ]
            */

            var objAttributeGroup = [];
            var oldGroup = "";
            conn.freeQuery(query).then(function(dataSet){
                if (dataSet.rows.length>0){
                    for (var x=0; x< dataSet.rows.length ; x++){
                        if (dataSet.rows[x].group !== oldGroup){
                            //obj[dataSet.rows[x].group] = [];
                            //objAttributeGroup.push(obj);
                        }
                    }
                    d.resolve(dataSet.rows);
                }else{
                    d.resolve(null);
                }
            });

        });

        return d.promise;
    },

    getAttributeValueGroupByFeature: function (feature, uuid) {

        var d = new q.defer();

        var query = "";
        query += " select ";
        query += " ag.description 'group', a.description, vfa.value ";
        query += " from attribute a ";
        query += " inner join attribute_group ag on a.attribute_group_uuid=ag.uuid ";
        query += " inner join attribute_group_feature agf on ag.uuid=agf.attribute_group_uuid ";
        query += " inner join feature f on f.uuid=agf.feature_uuid and f.description='"+feature+"' ";
        query += " left join "+feature+"_attribute vfa on vfa.attribute_uuid=a.uuid and vfa."+feature+"_uuid='"+uuid+"' ";
        query += " order by ag.description, a.order ";


        conn.freeQuery(query).then(function(dataSet){
            if (dataSet.rows.length>0){
                var obj = {};
                for (var x=0 ; x<dataSet.rows.length ; x++){
                    if (!obj[dataSet.rows[x].group]){
                        obj[dataSet.rows[x].group] = {};
                    }
                    obj[dataSet.rows[x].group][dataSet.rows[x].description] = dataSet.rows[x].value;
                }
                d.resolve(obj);
            }else{
                d.resolve(null);
            }
        });

        return d.promise;


    }
}




