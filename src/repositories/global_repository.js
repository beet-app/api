var q = require("q");
var common = require("../libs/common");
var conn = common.getLib('conn');

var validate   = common.getLib('validate');

module.exports = function(feature) {
    var schema = common.getLib('schema')(feature);
    return {
        getOne: function (search) {
            var d = new q.defer();

            conn.find(search).then(function (featureDataSet) {
                d.resolve(featureDataSet);
            });

            return d.promise;

        },
        find: function (search) {

            var d = new q.defer();

            search = schema.getSearchObj(search);

            conn.find(search).then(function(mainResult){

                d.resolve(mainResult);

            });

            return d.promise;

        },
        save: function (obj, mode) {
            var d = new q.defer();

            mode = common.isEmpty(mode) ? "save" : mode;


            obj = schema.getSaveObj(obj);

            conn.save(obj, mode).then(function(mainResult){

                d.resolve(mainResult);

            });

            return d.promise;

        },
        exists: function (search) {
            var d = new q.defer();

            if (typeof(search)=="string"){
                search = {field:"uuid",value:search};
            }

            var queryBuilder = {
                table: feature,
                filters: search
            };
            conn.query(queryBuilder).then(function (featureDataSet) {
                d.resolve(featureDataSet.rows.length > 0);
            });

            return d.promise;
        },
        getAttributeGroup: function (){
            var d = new q.defer();

            var attributeController = common.getController("attribute");
            attributeController.getAttributeGroupByFeature(feature).then(function(obj){
                d.resolve(common.getResultObj(obj.data));
            });

            return d.promise;
        },
        getAllByUser: function (user_uuid){
            var d = new q.defer();

            var attributeController = common.getController("attribute");
            attributeController.getAttributeValueGroupByUserFeature(user_uuid, feature).then(function(obj){
                d.resolve(common.getResultObj(obj.data));
            });

            return d.promise;
        },
        getAllByCompany: function (company_uuid){
            var d = new q.defer();
            var attributeController = common.getController("attribute");
            attributeController.getAttributeValueGroupByCompanyFeature(company_uuid, feature).then(function(obj){
                d.resolve(common.getResultObj(obj.data));
            });

            return d.promise;
        },
        getAll: function (queryBuilder) {
            var d = new q.defer();

            conn.query("select * from "+queryBuilder.table).then(function (featureDataSet) {
                d.resolve(featureDataSet);
            });

            return d.promise;

        },
        getAllByFilteredAttributes: function (obj) {
            var d = new q.defer();

            var query = "";
            query += " select a.uuid";
            query += " from " + feature + " a";
            query += " inner join " + feature + "_attribute b on (b."+feature+"_uuid = a.uuid)";
            query += " inner join attribute c on (c.uuid = b.attribute_uuid)";
            query += " where 1 = 1";

            var arr = common.turnToArray(obj);

            for (var x = 0 ; x < arr.length ; x++){
                var fields = "";
                var values = "";
                for (var key in arr[x]) {
                    query += " and (c.description = '" + key + "' and b.value = '" + arr[x][key] + "')";
                }
            }

            conn.query(query).then(function (dataSet) {


            });

            return d.promise;
        }
    }
};
