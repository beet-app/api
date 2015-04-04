var q = require("q");
var common = require("../libs/common");
var conn = common.getLib('conn');

module.exports = {
    getGroupByFeature: function (feature_uuid) {

        var d = new q.defer();

        var query =
            " select ag.uuid, ag.description" +
            " from attribute_group ag" +
            " inner join attribute_group_feature agf" +
            " on (agf.attribute_group_uuid = ag.uuid)" +
            " where agf.feature_uuid = '" + feature_uuid + "';";

        conn.query(query).then(function(dataSet){
            d.resolve(dataSet);
        });

        return d.promise;
    }
};