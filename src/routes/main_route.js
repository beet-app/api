var router = require("express").Router();
var common = require("../libs/common");

module.exports = function(app, passport) {


    router.get('/teste/:feature',
        function (req, res) {
            var conn = common.getLib("conn");
            conn.freeQuery("select * from "+req.params.feature).then(function(dataSet){
                res.json(dataSet.rows);
            });
            //res.redirect("http://127.0.0.1:9000/#/home");
        }
    );
    router.get('/teste2/:feature',
        function (req, res) {
            var ct = common.getController("global")(req.params.feature);
            ct.getAttributeGroup().then(function(teste){
                res.json(teste);
            });
            //res.redirect("http://127.0.0.1:9000/#/home");
        }
    );


    router.get('/logout', function(req, res) {
        req.logout();
        res.send(401);
        //    res.redirect('/');
    });
    router.get('/login', isLoggedIn, function (req, res) {
        res.send(req.user);
    });

    router.post('/login', passport.authenticate('local-login'),
        function (req, res) {
            res.json(req.user);
        }
    );

  router.post('/login/validate', function (req, res) {
    var userController = common.getController("user");
    userController.validate(req.body).then(function(response){
        res.json(response);
    });

  });


  router.post('/signup', function (req, res) {
        var userController = common.getController("user");

        userController.save(req.body).then(function(response){
          res.json(response);
        });

    });

    router.post('/user/validate', function (req, res) {
        var userController = common.getController("user");

        userController.validate(req.body).then(function(response){
            if (response.error !== null){
                res.json(401, response);
            }else{
                res.send(200);
            }
        });

    });

    router.get('/user/company', isLoggedIn, function (req, res) {
        var userController = common.getController("user");

        userController.getAllCompanies(req.user).then(function(response){
            if (response.error !== undefined){
                res.json(401, response);
            }else{
                res.json(response);
            }
        });

    });


    router.post('/company', function (req, res) {
        var companyController = common.getController("global")("company");

        companyController.save(req.body).then(function(response){
            if (common.isEmpty(response.error)){
                res.send(200);
            }else{
                res.json(401, response);
            }
        });

    });

  router.get('/attribute/:feature', function (req, res) {
    var feature = req.params.feature;

    var globalController = common.getController("global")(feature);

    globalController.getAttributeGroup().then(function(response){
      console.log(response);
      if (response.error !== undefined){
        res.json(401, response);
      }else{
        res.json(response);
      }
    });

  });




    /*
    var objPerson = require("../controllers/person");
    router.get("/:companyId/person" ,isLoggedIn, objPerson.listByCompany);
    router.get("/person/:personId" ,isLoggedIn, objPerson.findOne);
    router.post("/person",isLoggedIn, objPerson.insert);
    router.put("/person/:personId",isLoggedIn, objPerson.update);

    var objCompany = require("../controllers/company");
    router.get("/company/:companyId" ,isLoggedIn, objCompany.findOne);
    router.post("/company",isLoggedIn, objCompany.insert);
    router.put("/company/:companyId",isLoggedIn, objCompany.update);

    var objUser = require("../controllers/user");
    router.get("/user/:_id" ,isLoggedIn, objUser.findOne);
    router.put("/user/:_id",isLoggedIn, objUser.update);

    var objExpense = require("../controllers/expense");
    router.get("/expense/person/:personId/:initialDate/:finalDate" ,isLoggedIn, objExpense.listByPersonAndInterval);
    router.get("/expense/company/:companyId/:initialDate/:finalDate" ,isLoggedIn, objExpense.listByCompanyAndInterval);


    router.post("/expense",isLoggedIn, objExpense.insert);
    router.put("/expense/:_id",isLoggedIn, objExpense.update);
    router.delete("/expense/:_id",isLoggedIn, objExpense.delete);


    var objAttribute = require("../controllers/attribute");
    router.get("/attribute-grouped/:moduleId", isLoggedIn, objAttribute.listGroupedByModule);


    var arrCtrl = Array("menu","attribute-group", "attribute-type","attribute-template","attribute","person","module", "company","profile");

    for (var x = 0; x < arrCtrl.length; x++) {
        objCtrl = require("../controllers/" + arrCtrl[x]);
        router.get("/" + arrCtrl[x], isLoggedIn, objCtrl.list);
        router.post("/" + arrCtrl[x], isLoggedIn, objCtrl.insert);
        router.delete("/" + arrCtrl[x] + "/:id", isLoggedIn, objCtrl.delete);
        router.put("/" + arrCtrl[x] + "/:id", isLoggedIn, objCtrl.update);
    }




    /* POPULATING AREA *!/
    strCtrl = "attribute";

    objCtrl = require("../models/" + strCtrl);
    router.get("/" + strCtrl,  function (req,res){objCtrl.find(function(err, data){res.json(data)})});
    router.post("/" + strCtrl, function (req,res,next){objCtrl(req.body).save(res.send("OK !"))});

     /*

     */





    return router;
}

// route middleware to make sure
function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated())
    res.send(401);
else
    next();
}
