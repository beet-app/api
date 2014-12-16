var q = require("q");
bcrypt   = require('bcrypt-nodejs');
var common = require("../libs/common");
var conn = common.getLib('conn');
module.exports = {
    validatePassword: function (password, reqpassword) {
        var d = new q.defer();
        if (bcrypt.compareSync(reqpassword, password)){
          d.resolve(common.getResultObj(true));
        }else{
          d.resolve(common.getErrorObj("invalid_credentials"));
        }
        return d.promise;
    },
    getOne: function (search) {

        var d = new q.defer();

        if (typeof(search)=="string"){
          search = {field:"uuid",value:search};
        }

        var queryBuilder = {
          table: "user",
          filters: search
        };
        conn.query(queryBuilder).then(function(dataSet){
            if (dataSet.rows.length >0){
                d.resolve(common.getResultObj(dataSet.rows[0]));
            }else{
                d.resolve(common.getErrorObj("not_found_user"));
            }
        });

        return d.promise;

    },
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
    },
    validate: function (user) {
        var d = new q.defer();

        var userController = common.getController("global")("user");

        if (user.uuid !== undefined){

            userController.exists(user.uuid).then(function(blnExists){
                if (blnExists){
                    var query = "update user set active=1 where uuid='"+user.uuid+"'";
                    conn.freeExec(query).then(function(dataSet){
                        d.resolve(common.getResultObj(dataSet));
                    });
                }else{
                    d.resolve(common.getErrorObj("not_found_user"));
                }
            });

        }else{
            d.resolve(common.getErrorObj("missing_params"));
        }

        return d.promise;
    },
    getAllCompanies: function (user) {

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

/*
module.exports = {
    // use mongoose to get all menus in the database

    getOne: function (req, res, next) {
        res.send(true);
    },
    getOne2: function (req, res, next) {
        var connection = mysql.createConnection(config);

        connection.connect();

        connection.query('SELECT * from user', function(err, rows, fields) {
            if (err) return rows[0];
            return rows[0];
        });

        connection.end();
    },
    validPassword: function (req, res, next) {
        var connection = mysql.createConnection(config);

        connection.connect();

        connection.query('SELECT * from user', function(err, rows, fields) {
            if (err) throw err;

            res.send(true);
        });

        connection.end();
    },
    list: function (req, res, next) {
        objModel.find().exec(function (err, data) {
            if (err)
                res.send(err)
            res.json(data); // return all menus in JSON format
        });
    },


    insert: function (req, res, next) {
        var model = new objModel(req.body);
        model.save(function (err) {
            if (err)
                res.send(err);

            objModel.find(function (err, data) {
                if (err)
                    res.send(err)
                res.json(data);
            });
            //req.flash('info','Usuário cadastrado com sucesso!');

        });
    },

    update: function (req, res, next) {
        objModel.update({_id:req.params._id}, {$set:req.body}, {upsert: true}, function(err){
            if (err)
                res.send(err);

            res.send(200);
        });
    },




    delete: function (req, res) {
        objModel.remove({_id: req.params.id}, function (err) {
            if (err)
                res.send(err);

            objModel.find(function (err, data) {
                if (err)
                    res.send(err)
                res.json(data);
            });
        });
    }
}
*/
