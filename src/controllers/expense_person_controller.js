var q = require("q");
var common = require("../libs/common");

module.exports = function (repository, request) {
    var controller = {
        find: function () {
            var d = new q.defer();

            var controller = common.getController("expense_person",request);

            d.resolve(controller.getAllByPerson(request.params.uuid));

            return d.promise;
        }
    };
    return controller;
};

