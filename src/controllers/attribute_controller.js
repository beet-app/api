var q = require("q");
var common = require("../libs/common");
var attributeTypeController = common.getController('attribute_type');

module.exports = function(repository, request) {
    var controller =  {
        getAttributeGroupByFeature: function (feature, uuid) {
            var d = new q.defer();
            var hasDetail = common.hasDetail(common.getSchema(feature));
            attributeTypeController.getAllAsDict().then(function(attributeTypeDict) {
                repository.getAttributeGroupByFeature(feature, uuid).then(function (dataSet) {
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
                                if (dataSet.fields[y].name == "attribute_type_uuid") {
                                    attr["type"] = attributeTypeDict.data[dataSet.rows[x][dataSet.fields[y].name]];
                                } else {
                                    attr[dataSet.fields[y].name] = dataSet.rows[x][dataSet.fields[y].name];
                                }
                            }
                            obj[dataSet.rows[x].group].push(attr);
                        }
                        if (hasDetail){
                            controller.getDetailAttributeValueGroupByFeature(feature, uuid, attributeTypeDict).then(function(detailData){
                                if (!common.isError(detailData)) {
                                    obj.detail = detailData.data;
                                }
                                d.resolve(common.getResultObj(obj));
                            });
                        }else{
                            d.resolve(common.getResultObj(obj));
                        }
                    }
                });
            });
            return d.promise;
        },

        getAttributeValueGroupByFeature: function (feature, uuid) {
            var d = new q.defer();
            var hasDetail = common.hasDetail(common.getSchema(feature));
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
        getDetailAttributeValueGroupByFeature: function (feature, uuid, attributeTypeDict) {
            var d = new q.defer();
            var hasDetail = common.hasDetail(common.getSchema(feature));

            repository.getDetailAttributeValueGroupByFeature(feature, uuid).then(function(dataSet){
                if (common.isError(dataSet)){
                    d.resolve(common.getErrorObj("find_detail_attribute"));
                }else{


                    var obj = {};
                    for (var x = 0; x < dataSet.rows.length; x++) {
                        if (!obj[dataSet.rows[x].group]) {
                            obj[dataSet.rows[x].group]=[];
                        }

                        var attr = {};
                        for (var y = 0; y < dataSet.fields.length; y++) {
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
            return d.promise;
        },
        getAttributeValueGroupByFeatureCollection: function (feature, arrCollection) {
            var d = new q.defer();
            repository.getAttributeValueGroupByFeatureCollection(feature, arrCollection).then(function(dataSet){
                if(common.isError(dataSet)){
                    d.resolve(common.getErrorObj("find_attribute_collection"));
                }
                else{
                    d.resolve(common.getResultObj(dataSet));
                }
            });

            return d.promise;
        },

        getAllByFeature: function (main_feature, feature, feature_uuid) {
            var d = new q.defer();

            var ct = -1;
            var old_uuid = "";
            var arr = [];
            var group, description, value, sequence;


            repository.getAllByFeature(main_feature, feature, feature_uuid).then(function(dataSet){

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

        getAttributeValueGroupByUserFeature: function (user_uuid, feature) {
            var d = new q.defer();

            var ct = -1;
            var old_uuid = "";
            var arr = [];
            var group, description, value, sequence;

            var multiple = (common.getSchema(feature).fields.attribute.multiple===true);

            repository.getAttributeValueGroupByUserFeature(user_uuid, feature, multiple).then(function(dataSet){

                if (dataSet.rows.length>0){
                    if (multiple){
                        for (var x=0 ; x<dataSet.rows.length ; x++){
                            group = dataSet.rows[x].attribute_group;
                            description = dataSet.rows[x].attribute_description;
                            value = dataSet.rows[x].attribute_value;
                            sequence = dataSet.rows[x].sequence;
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
                            if (!arr[ct].attributes[group][description]) {
                                arr[ct].attributes[group][description] = [];
                            }
                            arr[ct].attributes[group][description].push({sequence:sequence,value:value});

                        }
                    }else{
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
            var hasDetail = common.hasDetail(common.getSchema(feature));


            repository.getAttributeValueGroupByCompanyFeature(company_uuid, feature).then(function(dataSet){
                if (dataSet.rows.length>0){
                    if (hasDetail){
                        controller.getDetailAttributeValueGroupByCompanyFeatureAsDict(company_uuid, feature).then(function(responseDictDetail) {
                            var objDictDetail = {};
                            if (!common.isError(responseDictDetail)){
                                objDictDetail = responseDictDetail.data;
                            }
                            for (var x = 0; x < dataSet.rows.length; x++) {
                                group = dataSet.rows[x].attribute_group;
                                description = dataSet.rows[x].attribute_description;
                                value = dataSet.rows[x].attribute_value;
                                if (dataSet.rows[x].uuid != old_uuid) {
                                    ct++;
                                    old_uuid = dataSet.rows[x].uuid;
                                    arr[ct] = dataSet.rows[x];
                                    delete arr[ct].attribute_group;
                                    delete arr[ct].attribute_description;
                                    delete arr[ct].attribute_value;
                                    arr[ct].attributes = {};
                                    if (!common.isEmpty(objDictDetail[arr[ct].uuid])){
                                        arr[ct].detail = objDictDetail[arr[ct].uuid];
                                    }
                                }
                                if (!arr[ct].attributes[group]) {
                                    arr[ct].attributes[group] = {};
                                }
                                arr[ct].attributes[group][description] = value;
                            }
                            d.resolve(common.getResultObj(arr));
                        });
                    }else {
                        for (var x = 0; x < dataSet.rows.length; x++) {
                            group = dataSet.rows[x].attribute_group;
                            description = dataSet.rows[x].attribute_description;
                            value = dataSet.rows[x].attribute_value;
                            if (dataSet.rows[x].uuid != old_uuid) {
                                ct++;
                                old_uuid = dataSet.rows[x].uuid;
                                arr[ct] = dataSet.rows[x];
                                delete arr[ct].attribute_group;
                                delete arr[ct].attribute_description;
                                delete arr[ct].attribute_value;
                                arr[ct].attributes = {};
                            }
                            if (!arr[ct].attributes[group]) {
                                arr[ct].attributes[group] = {};
                            }

                            arr[ct].attributes[group][description] = value;

                        }
                        d.resolve(common.getResultObj(arr));
                    }

                }else{
                    d.resolve(common.getResultObj([]));
                }
            });
            return d.promise;
        },

        getDetailAttributeValueGroupByCompanyFeatureAsDict : function(company_uuid, feature) {
            var d = new q.defer();

            var ct = -1;
            var old_uuid = "";
            var arr = [];
            var obj = {};
            var group, description, value;
            repository.getDetailAttributeValueGroupByCompanyFeatureAsDict(company_uuid, feature).then(function (dataSet) {
console.log("--------aa-----");
                console.log(dataSet.rows);
                if (dataSet.rows.length > 0) {
                    for (var x = 0; x < dataSet.rows.length; x++) {
                        group = dataSet.rows[x].attribute_group;
                        description = dataSet.rows[x].attribute_description;
                        value = dataSet.rows[x].attribute_value;
                        if (dataSet.rows[x].uuid != old_uuid) {
                            ct++;
                            old_uuid = dataSet.rows[x].uuid;
                            arr[ct] = dataSet.rows[x];
                            delete arr[ct].attribute_group;
                            delete arr[ct].attribute_description;
                            delete arr[ct].attribute_value;
                            arr[ct].attributes = {};
                        }
                        if (!arr[ct].attributes[group]) {
                            arr[ct].attributes[group] = {};
                        }

                        arr[ct].attributes[group][description] = value;

                    }
                    for (var x = 0; x < arr.length; x++) {
                        if (common.isEmpty(obj[arr[x][feature + "_uuid"]])) {
                            obj[arr[x][feature + "_uuid"]] = [];
                        }
                        obj[arr[x][feature + "_uuid"]].push(arr[x]);
                    }
                    d.resolve(common.getResultObj(obj));
                }else{
                    d.resolve(common.getResultObj([]));
                }

            });
            return d.promise;
        },
        getAttributeValueGroupByPersonFeature: function (person_uuid, feature) {
            var d = new q.defer();

            var ct = -1;
            var old_uuid = "";
            var arr = [];
            var group, description, value;
            var hasDetail = common.hasDetail(common.getSchema(feature));


            repository.getAttributeValueGroupByPersonFeature(person_uuid, feature).then(function(dataSet){

                if (dataSet.rows.length>0){
                    if (hasDetail){
                        controller.getDetailAttributeValueGroupByPersonFeatureAsDict(person_uuid, feature).then(function(responseDictDetail) {
                            var objDictDetail = {};
                            if (!common.isError(responseDictDetail)){
                                objDictDetail = responseDictDetail.data;
                            }
                            for (var x = 0; x < dataSet.rows.length; x++) {
                                group = dataSet.rows[x].attribute_group;
                                description = dataSet.rows[x].attribute_description;
                                value = dataSet.rows[x].attribute_value;
                                if (dataSet.rows[x].uuid != old_uuid) {
                                    ct++;
                                    old_uuid = dataSet.rows[x].uuid;
                                    arr[ct] = dataSet.rows[x];
                                    delete arr[ct].attribute_group;
                                    delete arr[ct].attribute_description;
                                    delete arr[ct].attribute_value;
                                    arr[ct].attributes = {};
                                    if (!common.isEmpty(objDictDetail[arr[ct].uuid])){
                                        arr[ct].detail = objDictDetail[arr[ct].uuid];
                                    }
                                }
                                if (!arr[ct].attributes[group]) {
                                    arr[ct].attributes[group] = {};
                                }
                                arr[ct].attributes[group][description] = value;
                            }

                            d.resolve(common.getResultObj(arr));
                        });
                    }else {

                        for (var x = 0; x < dataSet.rows.length; x++) {
                            group = dataSet.rows[x].attribute_group;
                            description = dataSet.rows[x].attribute_description;
                            value = dataSet.rows[x].attribute_value;
                            if (dataSet.rows[x].uuid != old_uuid) {
                                ct++;
                                old_uuid = dataSet.rows[x].uuid;
                                arr[ct] = dataSet.rows[x];
                                delete arr[ct].attribute_group;
                                delete arr[ct].attribute_description;
                                delete arr[ct].attribute_value;
                                arr[ct].attributes = {};
                            }
                            if (!arr[ct].attributes[group]) {
                                arr[ct].attributes[group] = {};
                            }

                            arr[ct].attributes[group][description] = value;

                        }
                        d.resolve(common.getResultObj(arr));
                    }

                }else{
                    d.resolve(common.getResultObj([]));
                }
            });
            return d.promise;
        },

        getDetailAttributeValueGroupByPersonFeatureAsDict : function(person_uuid, feature){
            var d = new q.defer();

            var ct = -1;
            var old_uuid = "";
            var arr = [];
            var obj = {};
            var group, description, value;
            repository.getDetailAttributeValueGroupByPersonFeatureAsDict(person_uuid, feature).then(function(dataSet){

                if (dataSet.rows.length>0){
                    for (var x = 0; x < dataSet.rows.length; x++) {
                        group = dataSet.rows[x].attribute_group;
                        description = dataSet.rows[x].attribute_description;
                        value = dataSet.rows[x].attribute_value;
                        if (dataSet.rows[x].uuid != old_uuid) {
                            ct++;
                            old_uuid = dataSet.rows[x].uuid;
                            arr[ct] = dataSet.rows[x];
                            delete arr[ct].attribute_group;
                            delete arr[ct].attribute_description;
                            delete arr[ct].attribute_value;
                            arr[ct].attributes = {};
                        }
                        if (!arr[ct].attributes[group]) {
                            arr[ct].attributes[group] = {};
                        }

                        arr[ct].attributes[group][description] = value;

                    }
                    for (var x = 0; x < arr.length; x++) {
                        if (common.isEmpty(obj[arr[x][feature+"_uuid"]])){
                            obj[arr[x][feature+"_uuid"]] = [];
                        }
                        obj[arr[x][feature+"_uuid"]].push(arr[x]);
                    }
                    d.resolve(common.getResultObj(obj));
                }

            });
            return d.promise;
        }

    };

    return controller;

}


