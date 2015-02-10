var q = require("q");
var common = require("../libs/common");
var attributeTypeController = common.getController('attribute_type');

module.exports = function(repository, request) {
    return {
        getAttributeGroupByFeature: function (feature) {
            var d = new q.defer();
            attributeTypeController.getAllAsDict().then(function(attributeTypeDict) {
                repository.getAttributeGroupByFeature(feature).then(function (dataSet) {
                    if (common.isError(dataSet)) {
                        d.resolve(common.getResultObj({}));
                    } else {
                        var obj = {};
                        for (var x = 0; x < dataSet.rows.length; x++) {
                            if (!obj[dataSet.rows[x].group]) {
                                obj[dataSet.rows[x].group]=[];
                            }

                            var attr = {};
                            for (var y = 0; y < dataSet.fields.length; y++) {
                                if (dataSet.fields[y].name == 'group')
                                    continue;
                                if (dataSet.fields[y].name == "attribute_type_uuid") {
                                    attr["type"] = attributeTypeDict.data[dataSet.rows[x][dataSet.fields[y].name]];
                                } else {
                                    attr[dataSet.fields[y].name] = dataSet.rows[x][dataSet.fields[y].name];
                                }
                            }
                            obj[dataSet.rows[x].group].push(attr);
                        }
                        d.resolve(common.getResultObj(obj));
                    }
                });
            });
            return d.promise;
        },

        getAttributeValueGroupByFeature: function (feature, uuid) {
            var d = new q.defer();

            repository.getAttributeValueGroupByFeature(feature, uuid).then(function(dataSet){
                if (common.isError(dataSet)){
                    d.resolve(common.getErrorObj("find_attribute"));
                }else{
                    var obj = {};
                    for (var x=0 ; x<dataSet.rows.length ; x++){
                        if (!obj[dataSet.rows[x].group]){
                            obj[dataSet.rows[x].group] = {};
                        }
                        obj[dataSet.rows[x].group][dataSet.rows[x].description] = dataSet.rows[x].value;
                    }
                    d.resolve(common.getResultObj(obj));
                }

            });
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
            conn.freeQuery(query).then(function(dataSet){
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

        getAttributeValueGroupByUserFeature: function (user_uuid, feature) {
            var d = new q.defer();

            var ct = -1;
            var old_uuid = "";
            var arr = [];
            var group, description, value;
            repository.getAttributeValueGroupByUserFeature(user_uuid, feature).then(function(dataSet){

                if (dataSet.rows.length>0){
                    for (var x=0 ; x<dataSet.rows.length ; x++){
                        group = dataSet.rows[x].attribute_group;
                        description = dataSet.rows[x].attribute_description;
                        value = dataSet.rows[x].attribute_value;
                        if (dataSet.rows[x].uuid != old_uuid){
                            ct++;
                            old_uuid = dataSet.rows[x].uuid;
                            arr[ct] = dataSet.rows[x];
                            delete arr[ct].attribute_group;
                            delete arr[ct].attribute_description;
                            delete arr[ct].attribute_value;
                            arr[ct].attributes = {};
                        }
                        if (!arr[ct].attributes[group]){
                            arr[ct].attributes[group] = {};
                        }

                        arr[ct].attributes[group][description] = value;

                    }


                }
                d.resolve(common.getResultObj(arr));
            });
            return d.promise;
        },

        getAttributeValueGroupByCompanyFeature: function (company_uuid, feature) {
            var d = new q.defer();

            var ct = -1;
            var old_uuid = "";
            var arr = [];
            var group, description, value;
            repository.getAttributeValueGroupByCompanyFeature(company_uuid, feature).then(function(dataSet){

                if (dataSet.rows.length>0){
                    for (var x=0 ; x<dataSet.rows.length ; x++){
                        group = dataSet.rows[x].attribute_group;
                        description = dataSet.rows[x].attribute_description;
                        value = dataSet.rows[x].attribute_value;
                        if (dataSet.rows[x].uuid != old_uuid){
                            ct++;
                            old_uuid = dataSet.rows[x].uuid;
                            arr[ct] = dataSet.rows[x];
                            delete arr[ct].attribute_group;
                            delete arr[ct].attribute_description;
                            delete arr[ct].attribute_value;
                            arr[ct].attributes = {};
                        }
                        if (!arr[ct].attributes[group]){
                            arr[ct].attributes[group] = {};
                        }

                        arr[ct].attributes[group][description] = value;

                    }


                }
                d.resolve(common.getResultObj(arr));
            });
            return d.promise;
        }

    }

}



