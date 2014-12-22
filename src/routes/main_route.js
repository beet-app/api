var router = require("express").Router();
var common = require("../libs/common");

module.exports = function (app, passport) {


  /*
   AUTHENTICATION ROUTES
   */


  router.post('/logout', function (req, res) {
    req.logout();
    res.send(200);
  });

  router.get('/login', isLoggedIn, function (req, res) {
    res.send(req.user);
  });

  router.post('/login', passport.authenticate('local-login'),
      function (req, res) {
        res.json(req.user);
      }
  );


  router.post('/signup', function (req, res) {l
    var userController = common.getController("user");

    userController.signUp(common.getRequestObj(req)).then(function (response) {
      if (common.isError(response)) {
        res.json(401, response);
      } else {
        res.send(200, response);
      }
    });

  });

  router.post('/user/validate', function (req, res) {
    var userController = common.getController("user");

    userController.validate(common.getRequestObj(req)).then(function (response) {
      if (common.isError(response)) {
        res.json(401, response);
      } else {
        res.send(200, response);
      }
    });

  });


  /*
   -------------------------------
   */


  /*
   GLOBAL ROUTES
   */
  var arrFeatures = ["company"];

  for (var x = 0; x < arrFeatures.length; x++) {
    var feature = arrFeatures[x];

    router.post("/" + feature, function (req, res) {
      var globalController = common.getController(feature);

      globalController.save(common.getRequestObj(req)).then(function (response) {
        if (common.isError(response)) {
          res.json(401, response);
        } else {
          res.send(200, response);
        }
      });

    });
    router.post("/" + feature + "/create", isLoggedIn, function (req, res) {
      var globalController = common.getController(feature);

      globalController.save(common.getRequestObj(req), "create").then(function (response) {
        if (common.isError(response)) {
          res.json(401, response);
        } else {
          res.send(200, response);
        }
      });

    });
    router.post("/" + feature  + "/update", function (req, res) {
      var globalController = common.getController(feature);

      globalController.save(common.getRequestObj(req), "update").then(function (response) {
        if (common.isError(response)) {
          res.json(401, response);
        } else {
          res.send(200, response);
        }
      });

    });
    router.get("/" + feature, function (req, res) {
      var globalController = common.getController(feature);

      globalController.find(common.getRequestObj(req)).then(function (response) {
        if (common.isError(response)) {
          res.json(401, response);
        } else {
          res.send(200, response);
        }
      });

    });
    router.delete("/" + feature, function (req, res) {
      var globalController = common.getController(feature);

      globalController.delete(common.getRequestObj(req)).then(function (response) {
        if (common.isError(response)) {
          res.json(401, response);
        } else {
          res.send(200, response);
        }
      });

    });
  }


  router.get('/attribute/:feature', function (req, res) {
    var feature = req.params.feature;

    var globalController = common.getController(feature);

    globalController.getAttributeGroup().then(function (response) {
      if (common.isError(response)) {
        res.json(401, response);
      } else {
        res.send(200, response);
      }
    });

  });


  /*
   -------------------------------
   */


  router.get('/user/company', isLoggedIn, function (req, res) {
    var userController = common.getController("user");

    userController.getAllCompanies(common.getRequestObj(req)).then(function (response) {
      if (common.isError(response)) {
        res.json(401, response);
      } else {
        res.send(200, response);
      }
    });

  });


  router.get('/teste/:feature',
      function (req, res) {
        var conn = common.getLib("conn");
        conn.query("select * from " + req.params.feature).then(function (dataSet) {
          res.json(dataSet.rows);
        });
        //res.redirect("http://127.0.0.1:9000/#/home");
      }
  );
  router.get('/teste2/:feature',
      function (req, res) {
        var ct = common.getController(req.params.feature);
        ct.getAttributeGroup().then(function (teste) {
          res.json(teste);
        });
        //res.redirect("http://127.0.0.1:9000/#/home");
      }
  );


  return router;
}

// route middleware to make sure
function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated())
    res.json(common.getErrorObj("unauthorized"));
  else
    next();
}

