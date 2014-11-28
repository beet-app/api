var objModel = require("../models/company");

module.exports = {

    list: function (req, res) {
        

        objModel.find({"members.user":req.user._id}).populate('members.user').populate('members.profile').exec(function (err, company) {
            if (err)
                res.send(err)

            objModel.populate(
                company, 
                {path: 'members.profile.menus', model: 'Menu'}, 
                function (err, companyMenus) {

                    objModel.populate(
                        company, 
                        {path: 'members.profile.menus.modules', model: 'Module'}, 
                        function (err, data) {

                            if (data.length > 0){
                                var arrCompanies = new Array(data.length);
                                for (var x=0; x< data.length; x++){
                                    if (data[x].members.length > 0){
                                        for (var y=0; y<data[x].members.length; y++){
                                            if (data[x].members[y].user._id.id == req.user._id.id){
                                                arrCompanies[x] = new Object();
                                                arrCompanies[x]._id = data[x]._id;
                                                arrCompanies[x].description = data[x].description;
                                                arrCompanies[x].attributes = data[x].attributes;
                                                arrCompanies[x].profile = data[x].members[y].profile.description;
                                                arrCompanies[x].menus = data[x].members[y].profile.menus;
                                            }
                                        }
                                    }
                                }
                            }


                        res.json(arrCompanies); // return all menus in JSON format
                    });
            });
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

    findOne: function (req, res, next) {
        objModel.findOne({_id:req.params.companyId}).populate('members.user').populate('members.profile').exec(function (err, data) {
            if (err)
                res.send(err)
            res.json(data); // return all menus in JSON format
        });
    },

    update: function (req, res, next) {
        /*objModel.findById(req.params.personId, function(err, data) {

            if (err)
                res.send(err);

            data.active = req.body.active;  // update the bears info

            // save the bear
            data.save(function(err) {
                if (err)
                    res.send(err);

                res.send(200);
            });

        });
*/

        objModel.update({_id:req.params.companyId}, {$set:req.body}, {upsert: true}, function(err){
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




