var objModel = require("../models/menu");
module.exports = {
    // use mongoose to get all menus in the database
    list: function (req, res, next) {
        objModel.find().populate('modules').exec(function (err, data) {
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
        objModel.update({_id:req.params.id}, {$set:req.body}, {upsert: true}, function(err){
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




