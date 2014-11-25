var objModel = require("../models/attribute");
var objTypeModel = require("../models/attribute-type");

module.exports = {
    // use mongoose to get all menus in the database
    list: function (req, res, next) {
        objModel.find().sort('order').populate('group').populate('type').exec(function (err, data) {
            if (err)
                res.send(err)
            res.json(data); // return all menus in JSON format
        });
    },

    listGroupedByModule: function (req, res, next) {
        objModel.find().sort('order').populate('group').populate('type').exec(function (err, data) {
            if (err)
                res.send(err)
            if (data.length > 0){
                
                var objAttributes = new Object();

                if (req.params.moduleId!=undefined){

                    var moduleId = req.params.moduleId;

                    for (var x=0; x< data.length; x++){ 
                        if (data[x].group != undefined){
                            if (data[x].group.module != undefined){
                                if(data[x].group.module == moduleId){
                                    if (objAttributes[data[x].group.description] == undefined){
                                        objAttributes[data[x].group.description] = new Array();
                                    }
                                    objAttributes[data[x].group.description].push(data[x]);
                                }
                            }
                        }
                    }
                }
            }
            res.json(objAttributes); // return all menus in JSON format
        });
    },
    update: function (req, res, next) {
        objModel.update({_id:req.params.id}, {$set:req.body}, {upsert: true}, function(err){
            if (err)
                res.send(err);

            res.send(200);
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




