var q = require("q");
var conn = require('../shared/conn');
var bcrypt   = require('bcrypt-nodejs');
var common   = require('../shared/common');
module.exports = {
    validateEmail: function (email) {

        var d = new q.defer();

        var queryBuilder = {
            table:"user",
            fields:["uuid","email","password"],
            filters:[
                {
                    field:"email",
                    value:email
                },
                {
                    field:"active",
                    value:'1'
                }
            ]
        };



        conn.query(queryBuilder).then(function(dataSet){
            if (dataSet.rows.length>0){
                d.resolve(dataSet.rows[0]);
            }else{
                d.resolve(null);
            }
        });

        return d.promise;

    },
    validatePassword: function (password, reqpassword) {
        var d = new q.defer();
        d.resolve(bcrypt.compareSync(reqpassword, password));
        return d.promise;
    },
    getOne: function (uuid) {

        var d = new q.defer();

        var queryBuilder = {
            table:"user",
            fields:["uuid,email"],
            filters:[
                {
                    field:"uuid",
                    value:uuid
                }
            ]
        };
        conn.query(queryBuilder).then(function(dataSet){
            if (dataSet.rows.length >0){
                d.resolve(dataSet.rows[0]);
            }else{
                d.resolve(null);
            }
        });

        return d.promise;

    },
    save: function (user) {
        var d = new q.defer();

        var userController = require("./global")("user");

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

                                    /*common.sendMail({
                                     "name":"LOGIN_VALIDATE",
                                     "recipients":[user.email],
                                     "params":{"uuid":user.uuid}
                                     });
                                     */

                                    d.resolve({result:dataSet.result, error:(dataSet.result.affectedRows>0) ? null : dataSet.error});

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

        var userController = require("./global")("user");

        if (user.uuid !== undefined){

            userController.exists(user.uuid).then(function(blnExists){
                if (blnExists){
                    var query = "update user set active=1 where uuid='"+user.uuid+"'";
                    conn.freeExec(query).then(function(dataSet){

                        /*common.sendMail({
                         "name":"LOGIN_VALIDATE",
                         "recipients":[user.email],
                         "params":{"uuid":user.uuid}
                         });*/

                        d.resolve({result:dataSet.result, error:(dataSet.result.affectedRows>0) ? null : dataSet.error});

                    });
                }else{
                    d.resolve(common.getErrorObj("not_found_user"));
                }
            });

        }else{
            d.resolve(common.getErrorObj("missing_params"));
        }

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
