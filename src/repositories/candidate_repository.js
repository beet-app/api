var q = require("q");
var common = require("../libs/common");
var conn = common.getLib('conn');

module.exports = {
    getByExam: function (uuid) {

        var feature = "candidate";
        var d = new q.defer();

        var query = "";
        query += " select ";
        query += " feat.*, ag.description 'attribute_group', a.description 'attribute_description', vfa.value 'attribute_value'";
        query += " from attribute a ";
        query += " inner join attribute_group ag on a.attribute_group_uuid=ag.uuid ";
        query += " inner join attribute_group_feature agf on ag.uuid=agf.attribute_group_uuid ";
        query += " inner join feature f on f.uuid=agf.feature_uuid and f.description='"+feature+"' ";
        query += " inner join exam_detail ed on ed.exam_uuid='"+uuid+"'";
        query += " inner join "+feature+" feat on feat.uuid = ed.candidate_uuid ";
        query += " left join "+feature+"_attribute vfa on vfa.attribute_uuid=a.uuid and vfa."+feature+"_uuid=feat.uuid ";
        query += " where vfa.value is not null";
        query += " order by feat.uuid,ag.description, a.order ";

        conn.query(query).then(function(dataSet){
            d.resolve(dataSet);
        });
        return d.promise;
    }
};

