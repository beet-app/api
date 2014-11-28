var objModel = require("../models/expense");
module.exports = {
    // use mongoose to get all menus in the database
    listByPersonAndInterval: function (req, res, next) {
        objModel
            .find(
                {
                    "person":req.params.personId,
                    "attributes.expense_data.date": {"$gte":req.params.initialDate, "$lt": req.params.finalDate}
                }
            ).sort('attributes.expense_data.date')
            .exec(function (err, data) {
                if (err)
                    res.send(err);


                    if (data.length > 0){
                        var objData = new Object();
                        for (var x=0; x< data.length; x++){
                            if (objData[data[x].attributes.expense_data.date]==undefined){
                                objData[data[x].attributes.expense_data.date]= new Array();
                            }
                            objData[data[x].attributes.expense_data.date].push(data[x]);
                        }
                        res.json(objData);
                    }                
                    else
                    {
                        res.json(data);
                    }

                
            });
    },
    listByCompanyAndInterval: function (req, res, next) {
        objModel
            .find(
            {
                "company":req.params.companyId,
                "attributes.expense_data.date": {"$gte":req.params.initialDate, "$lt": req.params.finalDate}
            }
        ).sort('attributes.expense_data.date')
            .exec(function (err, data) {
                if (err)
                    res.send(err);


                if (data.length > 0){
                    var objData = new Object();
                    for (var x=0; x< data.length; x++){
                        if (objData[data[x].attributes.expense_data.date]==undefined){
                            objData[data[x].attributes.expense_data.date]= new Array();
                        }
                        objData[data[x].attributes.expense_data.date].push(data[x]);
                    }
                    res.json(objData);
                }
                else
                {
                    res.json(data);
                }


            });
    },
    
//http://127.0.0.1:1313/api/expense/53ac59caad8f889c07000002/2014-07-18/2014-07-19
    findOne: function (req, res, next) {
        objModel.findOne({_id:req.params.personId}).exec(function (err, data) {
            if (err)
                res.send(err)
            res.json(data);
        });
    },

    list: function (req, res, next) {
        objModel.find().exec(function (err, data) {
            if (err)
                res.send(err)
            res.json(data);
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

            objModel.findOne({_id:req.params._id}).exec(function (err, data) {
                if (err)
                    res.send(err)
                res.json(data);
            });
        });

    },

    delete: function (req, res) {
        objModel.remove({_id: req.params._id}, function (err) {
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