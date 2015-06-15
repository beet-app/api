var q = require("q");
var common = require("../libs/common");
var conn = common.getLib('conn');

module.exports = {
    saveDetail: function (obj) {
console.log("3");
        var d = new q.defer();

        var uuid = require('node-uuid');

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
console.log("4");
            d.resolve(mainResult);

        });

        return d.promise;
    }




};


