var objModel = require("../models/attribute");
var objTypeModel = require("../models/attribute-type");

module.exports = {
    // use mongoose to get all menus in the database
    listGroupedByFeature: function (feature) {
        var query = "";
        query += "select";
        query += "ag.description 'group', a.description 'attribute'";
        query += "from attribute a";
        query += "inner join attribute_group ag on a.attribute_group_uuid=ag.uuid";
        query += "inner join attribute_group_feature agf on ag.uuid=agf.attribute_group_uuid";
        query += "inner join feature f on f.uuid=agf.feature_uuid and f.description='"+feature+"'";
        query += "";
    },

    listAttributeValueGroupedByFeature: function (feature) {
        var query = "";
        query += "select";
        query += "ag.description 'group', a.description 'attribute', vfa.value";
        query += "from attribute a";
        query += "inner join attribute_group ag on a.attribute_group_uuid=ag.uuid";
        query += "inner join attribute_group_feature agf on ag.uuid=agf.attribute_group_uuid";
        query += "inner join feature f on f.uuid=agf.feature_uuid and f.description='"+feature+"'";
        query += "left join "+feature+"_attribute vfa on vfa.attribute_uuid=a.uuid and vfa."+feature+"_uuid='"++"'";
        query += "";







    }
}




