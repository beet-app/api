var q = require("q");
var common = require("../libs/common");
var conn = common.getLib('conn');
module.exports = {


    getAttributeValueGroupByUserFeature: function (user_uuid, feature) {
        var d = new q.defer();

        var query = "";
        query += " select ";
        query += " feat.*, ag.description 'attribute_group', a.description 'attribute_description', vfa.value 'attribute_value'";
        query += " from attribute a ";
        query += " inner join attribute_group ag on a.attribute_group_uuid=ag.uuid ";
        query += " inner join attribute_group_feature agf on ag.uuid=agf.attribute_group_uuid ";
        query += " inner join feature f on f.uuid=agf.feature_uuid and f.description='"+feature+"' ";
        query += " inner join user_"+feature+" uf on uf.user_uuid = '"+user_uuid+"'";
        query += " inner join "+feature+" feat on feat.uuid = uf."+feature+"_uuid";
        query += " left join "+feature+"_attribute vfa on vfa.attribute_uuid=a.uuid and vfa."+feature+"_uuid=feat.uuid ";
        query += " where vfa.value is not null ";
        query += " order by feat.uuid,ag.description, a.order ";

        conn.query(query).then(function(dataSet){
            d.resolve(dataSet);
        });
        return d.promise;
    },
    chooseCompany: function (user_uuid, company_uuid) {


      var d = new q.defer();

      var query = "select company_uuid from user_company where user_uuid='" + user_uuid + "' AND company_uuid='" + company_uuid + "'";
      conn.query(query).then(function (dataSet) {
          d.resolve(dataSet);
      });

      return d.promise;

    },
    getFeatureByUserCompany : function (user_uuid, company_uuid){
        var d = new q.defer();

        var query = "";
        query += " select f.uuid";
        query += " from feature f";
        query += " inner join feature_module fm on (fm.feature_uuid = f.uuid)";
        query += " inner join module_plan mp on (mp.module_uuid = fm.module_uuid)";
        query += " inner join plan p on (p.uuid = mp.plan_uuid)";
        query += " inner join company c on (c.plan_uuid = p.uuid)";
        query += " inner join user_company uc on (uc.company_uuid = c.uuid)";
        query += " where uc.user_uuid = '" + user_uuid + "'";
        query += " and uc.company_uuid = '" + company_uuid + "'";
        query += " order by f.order";

        conn.query(query).then(function (dataset){
            d.resolve(dataset);
        });

        return d.promise;
    }
};



