var q = require("q");
var common = require("../libs/common");

module.exports = function(repository){
    return {
        save: function (user) {
            var d = new q.defer();

            if (user.email !== undefined && user.password !== undefined){

                if (common.isEmail(user.email)){

                    repository.insert({field:"email",value:user.email}).then(function(blnExists){
                        if (!blnExists){
                            common.sendMail({
                                "name":"validate_user",
                                "recipients":user.email,
                                "params":{"uuid":user.uuid}
                            });

                            d.resolve(common.getResultObj(dataSet.result));

                        }else{
                            d.resolve(common.getErrorObj("user_exists"));
                        }
                    });
                }else{
                    d.resolve(common.getErrorObj("invalid_email"));
                }


            }else{
                d.resolve(common.getErrorObj("missing_params"));
            }

            return d.promise;
        },
        validate: function (user) {
            var d = new q.defer();

            if (user.uuid !== undefined){
                user.active = "1";
                repository.update(user).then(function(result){
                    if (common.isError(result)){
                        d.resolve(common.getErrorObj("not_found_user"));
                    }else{
                        d.resolve(common.getResultObj(result));
                    }
                });
            }else{
                d.resolve(common.getErrorObj("missing_params"));
            }

            return d.promise;
        },
        getAllCompanies: function (user) {


            /*


            PAREI NA HORA DE TIRAR ESSA PORRA DAQUI.


             */


            var d = new q.defer();

            var queryBuilder = "select company_uuid from user_company where user_uuid='"+user.uuid+"'";
            conn.freeQuery(queryBuilder).then(function(dataSet){
                var arr = [];
                if (dataSet.rows.length >0){
                    var companyController = common.getController("global")("company");
                    var dataSetLength = dataSet.rows.length;
                    for (var x=0 ; x<dataSetLength ; x++){
                        companyController.getOne(dataSet.rows[x].company_uuid).then(function(company){
                            arr.push(company);
                            if (arr.length==dataSetLength){
                                d.resolve({data:arr});
                            }
                        });
                    }
                }else{
                    d.resolve({data:arr});
                }

            });

            return d.promise;

        }
    };
};
