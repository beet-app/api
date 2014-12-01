var q = require("q");
var conn = require('../shared/conn');

module.exports = {
    getOne: function (description) {

        var d = new q.defer();

        var query = "";
        query += "SELECT ea.*,a.description from email_attribute ea inner join attribute a on a.uuid=ea.attribute_uuid where ea.email_uuid in ( select email_uuid from email_attribute where value='"+description+"')";


        conn.freeQuery(query).then(function(dataSet){
            if (dataSet.rows.length >0){
                var obj = {};
                obj[dataSet.rows[0].description] = dataSet.rows[0].value;
                obj[dataSet.rows[1].description] = dataSet.rows[1].value;
                obj[dataSet.rows[2].description] = dataSet.rows[2].value;

                d.resolve(obj);
            }else{
                d.resolve(null);
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
