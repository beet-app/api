var router = require("express").Router();
var objCtrl = null;
var strCtrl = "";

module.exports = function(app, passport) {




    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    router.get('/', function (req, res) {
        res.send('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form


    // route to test if the user is logged in or not
    router.get('/loggedin', isLoggedIn, function (req, res) {
        res.send(req.user);
    });

    // process the login form
    router.post('/login', passport.authenticate('local-login'),
        function (req, res) {
            res.send(req.user);
            //res.redirect("http://127.0.0.1:9000/#/home");
        }
    );

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    router.get('/signup', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.send('cadastrar');
    });

    // process the signup form
    //app.post('/signup', passport.authenticate('local-signup', {
    //    successRedirect : '/profile', // redirect to the secure profile section
    //    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    //    failureFlash : true // allow flash messages
    //}));
    router.post('/signup', passport.authenticate('local-signup'),
        function (req, res) {
            // If this function gets called, authentication was successful.
            // `req.user` contains the authenticated user.
            res.send('registrou');
        }
    );


    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    router.get('/profile-check', isLoggedIn, function (req, res) {
        res.send("logado !");
        //res.render('profile.ejs', {
        //    user : req.user // get the user out of session and pass to template
        //});
    });
//
    //// =====================================
    //// LOGOUT ==============================
    //// =====================================
    router.get('/logout', function(req, res) {
        req.logout();
        res.send(401);
    //    res.redirect('/');
    });


    router.get('/logged-user', isLoggedIn, function (req, res) {
        res.json(req.user);
    });



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

     /* */





    return router;
}

// route middleware to make sure
function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) 
    res.send(401);
else
    next();
}

