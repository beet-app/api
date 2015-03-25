var q = require("q");
var common = require("../libs/common");
var driver = require("../libs/driver_mysql");

var log = false;

var lib = {
    query: function (query) {
        var d = new q.defer();
        /*
            The return should be {error:???, rows:???, fields:???}
         */
        driver.query(query).then(function(data){
            var obj = lib.getQueryReturnObject(data);
            if (log){
              common.logQuery(query, obj.rows);
            }
            d.resolve(obj);
        });
        return d.promise;
    },
    exec: function (query) {
        var d = new q.defer();
        /*
         The return should be {error:???, result:???}
         */
        driver.exec(query).then(function(data){
            var obj = lib.getExecReturnObject(data);
            if (log){
              common.logQuery(query, obj);
            }
            d.resolve(obj);
        });
        return d.promise;
    },
    find: function (queryBuilder) {


        var x, value;
        var d = new q.defer();

        var arrFields = queryBuilder.fields;
        var filters = queryBuilder.filters;


        var fields = "";
        if (arrFields !== undefined) {
            for (x = 0; x < arrFields.length; x++) {
                fields += (fields == "") ? arrFields[x] : "," + arrFields[x];
            }
        }else{
            fields = "*"
        }

        var where = "";
        if (filters !== undefined){
            if (filters.length === undefined){
                if (!filters.operator){
                    filters.operator = "=";
                }
                value = driver.escape(filters.value);
                where += (where == "") ? filters.field + filters.operator + value + "" : " AND " + filters.field + filters.operator + value + "";
            }else{
                for (x = 0; x < filters.length; x++) {
                    if (!filters[x].operator){
                        filters[x].operator = "=";
                    }
                    value = driver.escape(filters[x].value);
                    where += (where == "") ? filters[x].field + filters[x].operator + value + "" : " AND " + filters[x].field + filters[x].operator + value + "";
                }
            }

        }
        var query = "SELECT " + fields;

        query += " FROM " + queryBuilder.table;
        if (where != ""){
            query += " WHERE " + where;
        }

        lib.query(query).then(function(queryResult){
            d.resolve(queryResult);
        });

        return d.promise;

    },
    save: function (obj, mode) {

        var d = new q.defer();
        mode = (common.isEmpty(mode)) ? "save" : mode.toLowerCase();

        var parent = (obj.parent) ? obj.parent : obj;

        lib.exists(parent).then(function(parentExists) {
            if (common.isError(parentExists)){
                d.resolve(parentExists);
            }else{
                if (parentExists.result && mode=="create"){
                    d.resolve({error:"already_exists"});
                }else if(!(parentExists.result) && mode=="update"){
                    d.resolve({error:"inexistent"});
                }else{
                    var sql = (parentExists.result) ? lib.getUpdateSql(parent) : lib.getInsertSql(parent);
                    lib.exec(sql).then(function(parentExec) {
                        if (common.isEmpty(parentExec.error)){

	                        lib.saveDetail(obj).then(function(detailExec){

		                        if (common.isEmpty(obj.children)){
			                        d.resolve(parentExec);
		                        }else{
			                        lib.saveChildren(obj.children).then(function(childrenExec){
				                        if (common.isEmpty(childrenExec)){
					                        d.resolve(childrenExec);
				                        }else{
					                        d.resolve(childrenExec);
				                        }
			                        });
		                        }

	                        });



                        }else{
                            d.resolve(parentExec);
                        }
                    });
                }
            }
        });

        return d.promise;

    },
    saveChildren: function (children) {
        var d = new q.defer();

        var sql = "";
        for (var x = 0 ; x<children.length ; x++){
            sql += lib.getDeleteBeforeInsertSql(children[x])+lib.getInsertSql(children[x]);
        }
        lib.exec(sql).then(function(childrenExec) {
            d.resolve(childrenExec);
        });


        return d.promise;

    },
	saveDetail: function (obj) {
		var d = new q.defer();

		if (common.isEmpty(obj.detail)){
			d.resolve(null);
		}else{
			var sqlParent = "";
			var sqlParentDelete = "";
			var sqlChildren = "";
			var sqlChildrenDelete = "";
			for (var x = 0 ; x<obj.detail.length ; x++){
				var detail = {};
				var attributes = obj.detail[x].attribute;
				delete obj.detail[x].attribute;
				detail.table = obj.parent.table + "_detail";
				detail.fields=obj.detail[x];
				detail.indexes=[];
				sqlParent += lib.getInsertSql(detail);
				sqlParentDelete += lib.getDeleteBeforeInsertSql(detail);
				for (var y = 0 ; y<attributes.length ; y++){
					var attribute = {};
					attribute.table = detail.table + "_attribute";
					attribute.indexes = [obj.parent.table+"_uuid"];
					attribute.fields = attributes[y];
					sqlChildrenDelete += lib.getDeleteBeforeInsertSql(attribute);
					sqlChildren += lib.getInsertSql(attribute);
				}

			}

			lib.exec(sqlParent).then(function(parentExec) {
				lib.exec(sqlChildren).then(function(childrenExec) {
					d.resolve(childrenExec);
				});

			});
		}

		return d.promise;

	},
    exists: function (obj) {
        var d = new q.defer();
        lib.query(lib.getExistsSql(obj)).then(function(parentExists) {
            if (common.isError(parentExists)){
                d.resolve(parentExists);
            }else{
                d.resolve({result:(parentExists.rows.length > 0)});
            }
        });
        return d.promise;
    },
    getQueryReturnObject: function (data) {
        var obj = {};
        if (common.isError(data)){
            obj.error = data.error;
        }else{
            obj.rows = data.rows;
            obj.fields = data.fields;
        }
        return obj;
    },
    getExecReturnObject: function (data) {
        var obj = {};

        if (common.isError(data)){
            obj.error = data.error;
        }else{
            obj.result = data.result;
        }
        return obj;
    },
    getInsertSql: function (obj) {
        var arr = common.turnToArray(obj.fields);
        var sql="";
        for (var x = 0 ; x < arr.length ; x++){
            var fields = "";
            var values = "";
            for (var key in arr[x]) {
                fields += (fields == "") ? key : "," + key;
                values += (values == "") ? "'" + arr[x][key] + "'" : ",'" + arr[x][key] + "'";
            }
            sql += "INSERT INTO " + obj.table + " (" + fields + ") VALUES (" + values + ");";
        }
        return sql;
    },
    getUpdateSql: function (obj) {
        var arr = common.turnToArray(obj.fields);
        var sql="";
        for (var x = 0 ; x < arr.length ; x++){
            var fields = obj.indexes[0] + "=" + obj.indexes[0];
            var where = "";
            for (var key in arr[x]){
                if (!common.inArray(key, obj.indexes)){
                    fields += ","+key+"='"+arr[x][key]+"'";
                }
            }
            for (var key in obj.indexes){
                where += (where=="") ? obj.indexes[key]+"='"+arr[x][obj.indexes[key]]+"'" : " AND "+obj.indexes[key]+"='"+arr[x][obj.indexes[key]]+"'";
            }
            sql +=  "UPDATE " + obj.table + " SET " + fields + " WHERE " + where + ";";
        }
        return sql;
    },
    getExistsSql: function (obj) {
        var arr = common.turnToArray(obj.fields);
        var sql="";
        for (var x = 0 ; x < arr.length ; x++){
            var fields = "";
            var where = "";
            for (var key in obj.indexes){
                fields += (fields=="") ? obj.indexes[key] : ","+obj.indexes[key];
                where += (where=="") ? obj.indexes[key]+"='"+arr[x][obj.indexes[key]]+"'" : " AND "+obj.indexes[key]+"='"+arr[x][obj.indexes[key]]+"'";
            }
            sql +=   "SELECT " + fields + " FROM " + obj.table + " WHERE " + where + ";";
        }
        return sql;
    },
    getDeleteBeforeInsertSql: function (obj) {
        var arr = common.turnToArray(obj.fields);
        var sql="";
        for (var x = 0 ; x < arr.length ; x++){
            var where = "";
            for (var key in obj.indexes){
                where += (where=="") ? obj.indexes[key]+"='"+arr[x][obj.indexes[key]]+"'" : " AND "+obj.indexes[key]+"='"+arr[x][obj.indexes[key]]+"'";
            }
            sql +=   "DELETE FROM " + obj.table + " WHERE " + where + ";";
        }
        return sql;
    },
    getEmptyDataSet:function(){
      return lib.getQueryReturnObject({rows:[],fields:[]});
    }
};

module.exports = lib;
