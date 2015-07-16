var q = require("q");
var common = require("../libs/common");
var conn = common.getLib('conn');

module.exports = {
    saveDetail: function (obj) {
        var d = new q.defer();
        var uuid = require('node-uuid');

        var query = "";
        query += " select a.uuid";
        query += " from exam_detail a";
        query += " where a.exam_uuid = '" + obj.exam_uuid + "'";
        query += " and a.candidate_uuid = '" + obj.candidate_uuid + "'";

        conn.query(query).then(function(dataSet){
            if(dataSet.rows.length === 0){
                var objSave = {
                    parent: {
                        table: 'exam_detail',
                        fields: {
                            uuid: uuid.v1(),
                            exam_uuid: obj.exam_uuid,
                            candidate_uuid: obj.candidate_uuid,
                        },
                        indexes: ['uuid']
                    }

                };

                conn.save(objSave, "save").then(function(mainResult){
                    d.resolve(mainResult);
                });
            }
            else{
                d.resolve(common.getResultObj([]));
            }

        });

        return d.promise;
    }
};