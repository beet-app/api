var q = require("q");
var common = require("../libs/common");

module.exports = function(repository){
    return {
        signUp: function (request) {
            var d = new q.defer();
            var data = request.data;
            if (data.email !== undefined && data.password !== undefined){

                if (common.isEmail(data.email)){

                    this.getOne({field:"email",value:data.email}).then(function(userExists){
                        var userController = common.getController("user");

                        if (common.isError(userExists)){
                            data.password = common.generateHash(data.password);
                            userController.save(data, "create").then(function(createResult){
                                if (common.isError(createResult)){
                                    d.resolve(createResult);
                                }else{
                                    userController.getOne({field:"email",value:data.email}).then(function(userResponse){
                                        if (common.isError(userResponse)){
                                            d.resolve(common.getErrorObj("create_user"));
                                        }else{

                                            var user = userResponse.data;
                                            common.sendMail({
                                                "name":"validate_user",
                                                "recipients":user.email,
                                                "params":{"uuid":user.uuid}
                                            });
                                            d.resolve(common.getSuccessObj());
                                        }

                                    });

                                }
                            });


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
        validate: function (request) {
            var d = new q.defer();
            if (request.data.uuid !== undefined){
                request.data.active = 1;
                this.save(request, "update").then(function(result){
                    if (common.isError(result)){
                        d.resolve(common.getErrorObj("validate_user"));
                    }else{
                        d.resolve(common.getSuccessObj());
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
            repository.freeQuery(queryBuilder).then(function(dataSet){
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
