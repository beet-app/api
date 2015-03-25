var mysql = require('mysql');
var q = require("q");
var common = require("../libs/common");

module.exports = function(feature){
    return {
        generateUUID: function(){
            var uuid = require('node-uuid');

            return uuid.v1();
        },
        /*

        {
            uuid : 1213123--daa-23a-d-as-d-3,
            plan : 1213123--444-23a-d-as-d-3,
            attribute : [
                 {
                    uuid:"1213123--daa-23a-d-as-d-3",
                    value:"atletico mineiro"
                 },
                 {
                    uuid:"1213123aa-asd23a-d-as-d-3",
                    value:"1233.1213.123/00102"
                 },
                 {
                    uuid:"1213123aa-asd23a-d-as-d-3",
                    value:"clube atletico mineiro"
                 },
            ],
            user:{
                uuid:"1213123--daa-23a-d-as-d-3",
                profile:"1213123--daa-23a-d-as-d-3"
            }
        }
         var schema = {
             uuid : "string",
             plan:{
                table: "plan"
             },
             user:{
                table: "user_company"
             },
             attribute:{
                table: "company_attribute"
             }
         };


         var schema = {
             company:{
                table: "company"
             },
             user:{
                table: "user"
             },
             profile:{
                table: "profile"
             }
         };
        */
        getIndexes: function(obj){
            var key;

            for (key in obj){
                if (typeof(obj[key])=="object"){
                    children.push({table:schema[key].table,fields:obj[key]});
                }else{
                    parent.fields[key] = obj[key];
                }
            }

            if (children.length>0){
                return {parent:parent, children:children};
            }else{
                return parent;
            }

        },
        getSaveObj: function(obj){
            var key;
            var x;
            var schema = common.getSchema(feature);

            if (!common.isEmpty(schema.fields.uuid) && common.isEmpty(obj.uuid)){
                obj.uuid = this.generateUUID();
            }
            var obj = this.merge(obj, schema);
            var parent = {table:feature,fields:{}};
            var children = [];
	        var detail = null;

            if (common.isEmpty(schema.indexes)){
                parent.indexes = ["uuid"];
            }else{
                parent.indexes = schema.indexes;
            }

            var arrIndexes;

            for (key in obj){
	            if (key=="detail"){
		            detail = obj[key];
	            }else if (typeof(obj[key])=="object"){
	                if (schema.fields[key].table.indexOf("attribute")>0){
		                arrIndexes = ["attribute_uuid",feature+"_uuid"];
	                }else{
		                arrIndexes = schema.fields[key].table.split("_");
		                for (var x=0 ; x<arrIndexes.length ; x++){
			                arrIndexes[x] = arrIndexes[x] + "_uuid";
		                }
	                }

                    children.push({table:schema.fields[key].table,indexes:arrIndexes,fields:obj[key]});
                }else{
                    parent.fields[key] = obj[key];
                }
            }
	        var returnObj = {parent:parent};

            if (children.length>0){
	            returnObj.children = children;
            }
	        if (!common.isEmpty(detail)){
		        returnObj.detail = detail;
            }
			return returnObj;
        },

        merge: function(obj, featureSchema){
            var key;
            var arrChildren;
            var x, y;
            var childrenSchema;
            var children;
            var schema = {};
	        if (common.hasDetail(featureSchema)){
				var arrDetail = [];

		        for (x=0 ; x<obj.detail.length ; x++){
			        var objDetail = {};
			        objDetail.uuid = this.generateUUID();
			        objDetail[featureSchema.detail.attribute.table.replace("_detail_attribute","_uuid")] = obj.uuid;
			        objDetail.attribute = [];
			        for (y=0 ; y<obj.detail[x].attribute.length ; y++) {
				        var objDetailAttribute = {};
				        objDetailAttribute.attribute_uuid = obj.detail[x].attribute[y].uuid;
				        objDetailAttribute.value = obj.detail[x].attribute[y].value;
				        objDetailAttribute[featureSchema.detail.attribute.table.replace("_attribute","_uuid")] = objDetail.uuid;
				        objDetail.attribute.push(objDetailAttribute);
			        }
			        arrDetail.push(objDetail);
		        }
		        schema.detail = arrDetail;
	        }

	        featureSchema = featureSchema.fields;
            for (key in featureSchema){
                if (!common.isEmpty(obj[key])){
                    if (!common.isEmpty(featureSchema[key].table)){
                        if(key==featureSchema[key].table){
                            if (common.isEmpty(featureSchema[key].index)){
                                schema[key + "_uuid"] = obj[key];
                            }else{
                                schema[featureSchema[key].index] = obj[key];
                            }
                        }else{
                            if (key=="attribute"){
                                childrenSchema="attribute";
                            }else{
                                childrenSchema = common.getSchema(featureSchema[key].table).fields;
                            }


                            arrChildren = common.turnToArray(obj[key]);

                            schema[key] = [];

                            for (x=0 ; x < arrChildren.length ; x++){
                                if (!common.isEmpty(arrChildren[x].uuid)){
                                    arrChildren[x][key] = arrChildren[x].uuid;
                                }
                                if (childrenSchema=="attribute"){
                                    children = {};
                                    children[feature + "_uuid"] = obj.uuid;
                                    children["attribute_uuid"] = arrChildren[x].attribute;
                                    children["value"] = arrChildren[x].value;
									if (!common.isEmpty(arrChildren[x].sequence)){
										children["sequence"] = arrChildren[x].sequence;
									}
                                }else if (childrenSchema!=null){
                                    arrChildren[x][feature] = obj.uuid;
                                    children = this.merge(arrChildren[x], childrenSchema)
                                }else{
                                    children = {};
                                    if (common.isEmpty(featureSchema[key].parent_index)){
                                        children[featureSchema[key].parent_index] = obj.uuid;
                                    }else{
                                        children[feature+"_uuid"] = obj.uuid;
                                    }
                                    if (common.isEmpty(featureSchema[key].children_index)){
                                        children[featureSchema[key].children_index] = arrChildren[x];
                                    }else{
                                        children[featureSchema[key].table+"_uuid"] = arrChildren[x];
                                    }
                                }
                                schema[key].push(children);
                            }

                        }
                    }else{
                        if (typeof(featureSchema[key])=="object"){
                            if (typeof(obj[key])==featureSchema[key].type){
                                schema[key] = obj[key];
                            }else{
                                common.logError("type_mismatch", obj);
                            }
                        }else{
                            if (typeof(obj[key])==featureSchema[key]){
                                schema[key] = obj[key];
                            }else{
                                common.logError("type_mismatch", obj);
                            }
                        }
                    }
                }
            }
            return schema;
        }
    }
};
