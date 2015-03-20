var q = require("q");
var common = require("../libs/common");
var conn = common.getLib('conn');
module.exports = {

    getAttributeGroupByFeature: function (feature, uuid) {
        var d = new q.defer();

        var query = "";
        query += " select";
        query += " ag.description 'group', a.uuid, a.description, a.order, a.size, cast(a.required as signed) 'required',";
        query += " a.attribute_type_uuid";
        if (!common.isEmpty(uuid)){
          query += " ,vfa.value";
        }
        query += " from attribute a";
        query += " inner join attribute_group ag on a.attribute_group_uuid=ag.uuid";
        query += " inner join attribute_group_feature agf on ag.uuid=agf.attribute_group_uuid";
        query += " inner join feature f on f.uuid=agf.feature_uuid and f.description='" + feature + "'";
        if (!common.isEmpty(uuid)){
          query += " left join "+feature+"_attribute vfa on vfa.attribute_uuid=a.uuid and vfa."+feature+"_uuid='"+uuid+"' ";

        }
        query += " order by ag.description, a.order";

        conn.query(query).then(function (dataSet) {
          common.log(dataSet);
            d.resolve(dataSet);
        });

        return d.promise;
    },

    getAttributeValueGroupByFeature: function (feature, uuid) {
        var d = new q.defer();
        var featureSchema = common.getSchema(feature);
        common.log(featureSchema);
        if (common.isEmpty(featureSchema.fields.attribute)){
            d.resolve(conn.getEmptyDataSet());
        }else{
            var query = "";
            query += " select ";
            query += " ag.description 'group', a.description, vfa.value ";
            query += " from attribute a ";
            query += " inner join attribute_group ag on a.attribute_group_uuid=ag.uuid ";
            query += " inner join attribute_group_feature agf on ag.uuid=agf.attribute_group_uuid ";
            query += " inner join feature f on f.uuid=agf.feature_uuid and f.description='"+feature+"' ";
            query += " left join "+feature+"_attribute vfa on vfa.attribute_uuid=a.uuid and vfa."+feature+"_uuid='"+uuid+"' ";
            query += " where vfa.value is not null ";
            query += " order by ag.description, a.order ";

            conn.query(query).then(function(dataSet){
                d.resolve(dataSet);
            });
        }

        return d.promise;
    },

    getAttributeValueGroupByFeatureCollection: function (feature, arrCollection) {
        var d = new q.defer();

        strUuidFilter = "";
        for (var x=0; x< arrCollection.length ; x++){
            if (strUuidFilter==="") {
                strUuidFilter+= "'" + arrCollection[x].uuid + "'";
            }else{
                strUuidFilter+= ",'" + arrCollection[x].uuid + "'";
            }
        }

        var query = "";
        query += " select ";
        query += " vfa."+feature+"_uuid 'feature_uuid', ag.description 'group', a.description, vfa.value ";
        query += " from attribute a ";
        query += " inner join attribute_group ag on a.attribute_group_uuid=ag.uuid ";
        query += " inner join attribute_group_feature agf on ag.uuid=agf.attribute_group_uuid ";
        query += " inner join feature f on f.uuid=agf.feature_uuid and f.description='"+feature+"' ";
        query += " inner join "+feature+" feat on feat.uuid in ("+strUuidFilter+")";
        query += " left join "+feature+"_attribute vfa on vfa.attribute_uuid=a.uuid";
        query += " order by vfa."+feature+"_uuid,ag.description, a.order ";

        var ct = -1;
        var old_uuid = "";
        conn.query(query).then(function(dataSet){
            if (dataSet.rows.length>0){
                for (var x=0 ; x<dataSet.rows.length ; x++){
                    if (dataSet.rows[x].feature_uuid != old_uuid){
                        ct++;
                        old_uuid = dataSet.rows[x].feature_uuid;
                        arrCollection[ct].attributes = {};
                    }
                    if (!arrCollection[ct].attributes[dataSet.rows[x].group]){
                        arrCollection[ct].attributes[dataSet.rows[x].group] = {};
                    }
                    arrCollection[ct].attributes[dataSet.rows[x].group][dataSet.rows[x].description] = dataSet.rows[x].value;
                }

                d.resolve(arrCollection);
            }else{
                d.resolve(null);
            }
        });
        return d.promise;
    },
	getAttributeValueGroupByUserFeature: function (user_uuid, feature, multiple) {
		var d = new q.defer();

		var query = "";
		query += " select ";
		query += " feat.*, ag.description 'attribute_group', a.description 'attribute_description', vfa.value 'attribute_value'";
		if (multiple){
			query += ", vfa.sequence ";
		}
		query += " from attribute a ";
		query += " inner join attribute_group ag on a.attribute_group_uuid=ag.uuid ";
		query += " inner join attribute_group_feature agf on ag.uuid=agf.attribute_group_uuid ";
		query += " inner join feature f on f.uuid=agf.feature_uuid and f.description='"+feature+"' ";
		query += " inner join user_"+feature+" uf on uf.user_uuid = '"+user_uuid+"'";
		query += " inner join "+feature+" feat on feat.uuid = uf."+feature+"_uuid";
		query += " left join "+feature+"_attribute vfa on vfa.attribute_uuid=a.uuid and vfa."+feature+"_uuid=feat.uuid ";
		query += " where vfa.value is not null ";
		if (multiple){
			query += " order by feat.uuid,ag.description, a.order, vfa.sequence";
		}else{
			query += " order by feat.uuid,ag.description, a.order";

		}


		conn.query(query).then(function(dataSet){
			d.resolve(dataSet);
		});
		return d.promise;
	},

	getAttributeValueGroupByCompanyFeature: function (company_uuid, feature, multiple) {
		var d = new q.defer();

		var query = "";
		query += " select ";
		query += " feat.*, ag.description 'attribute_group', a.description 'attribute_description', vfa.value 'attribute_value'";
		if (multiple){
			query += ", vfa.sequence ";
		}
		query += " from attribute a ";
		query += " inner join attribute_group ag on a.attribute_group_uuid=ag.uuid ";
		query += " inner join attribute_group_feature agf on ag.uuid=agf.attribute_group_uuid ";
		query += " inner join feature f on f.uuid=agf.feature_uuid and f.description='"+feature+"' ";
		query += " inner join "+feature+" feat on feat.company_uuid = '"+company_uuid+"'";
		query += " left join "+feature+"_attribute vfa on vfa.attribute_uuid=a.uuid and vfa."+feature+"_uuid=feat.uuid ";
		query += " where vfa.value is not null";
		if (multiple){
			query += " order by feat.uuid,ag.description, a.order, vfa.sequence ";
		}else{
			query += " order by feat.uuid,ag.description, a.order ";

		}

		conn.query(query).then(function(dataSet){
			common.log(dataSet);
			d.resolve(dataSet);
		});
		return d.promise;
	}
}




