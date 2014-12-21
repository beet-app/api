var q = require("q");
bcrypt   = require('bcrypt-nodejs');
var common = require("../libs/common");
var conn = common.getLib('conn');
module.exports = {

    save: function (user) {
        var d = new q.defer();

        var userController = common.getController("global")("user");

        if (user.email !== undefined && user.password !== undefined){

            var validator = require('validator');
            if (validator.isEmail(user.email)){
                userController.exists({field:"email",value:user.email}).then(function(blnExists){
                    if (!blnExists){
                        if (user.uuid === undefined){
                            common.generateUUID().then(function(uuid){
                                user.uuid = uuid;
                                user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(8), null);
                                conn.freeExec("insert into user values ('"+user.uuid+"','"+user.email+"','"+user.password+"',0)").then(function(dataSet){
                                    //conn.freeExec("delete from user where email<>'admin'").then(function(dataSet){

                                    common.sendMail({
                                        "name":"validate_user",
                                        "recipients":user.email,
                                        "params":{"uuid":user.uuid}
                                    });

                                    d.resolve(common.getResultObj(dataSet.result));
                                });
                            });

                        }else{
                            d.resolve(common.getErrorObj("not_yet"));
                        }
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
    }
};
