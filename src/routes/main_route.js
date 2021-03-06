var router = require('express').Router();
var common = require('../libs/common');

var multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();

module.exports = function (app, passport) {
    router.use(multipartyMiddleware);

    /*
     AUTHENTICATION ROUTES
     */


    router.post('/logout', function (req, res) {
        req.logout();
        res.send(200);
    });

    router.get('/login', isLoggedIn, function (req, res) {
        res.send(common.getResultObj(req.user));
    });

    router.post('/login', passport.authenticate('local-login'),
        function (req, res) {
            delete req.user.data.password;
            delete req.user.data.active;
            res.json(req.user);
        }
    );


    router.post('/signup', function (req, res) {
        var userController = common.getController("user", req);

        userController.signUp(common.getRequestObj(req)).then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });

    });

    router.post('/user/validate', function (req, res) {
        var userController = common.getController("user", req);

        userController.validate().then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });

    });

    router.post('/company/choose', isLoggedIn,
        function (req, res) {

            var userController = common.getController("user", req);

            userController.chooseCompany().then(function(response){
                if (common.isError(response)) {
                    res.json(401, response);
                } else {
                    res.json(200, response);
                }
            });
        }
    );


    /*
     -------------------------------
     */


    /*
     GLOBAL ROUTES
     */

    router.post("/:feature", function (req, res) {
        var globalController = common.getController(req.params.feature, req);

        globalController.save().then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });

    });
    router.post("/:feature/create", function (req, res) {
        var globalController = common.getController(req.params.feature, req);
        globalController.save("create").then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });

    });
    router.post("/:feature/update", function (req, res) {
        var globalController = common.getController(req.params.feature, req);

        globalController.save("update").then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });
    });
    router.post("/:feature/save", function (req, res) {
        var globalController = common.getController(req.params.feature, req);

        globalController.save("save").then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });
    });
    router.get("/:feature", function (req, res) {
        var globalController = common.getController(req.params.feature, req);

        globalController.find().then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });
    });
    router.get("/:feature/:uuid", function (req, res) {
        var globalController = common.getController(req.params.feature, req);

        globalController.find().then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });
    });
    router.get("/find/:feature/:feature_name/:feature_uuid", function (req, res) {
        var globalController = common.getController(req.params.feature, req);
        globalController.getAllByFeature(req.params.feature_name, req.params.feature_uuid).then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });
    });
    router.get('/candidate/exam/:uuid', isLoggedIn, function (req, res) {
        var candidateController = common.getController("candidate", req);

        candidateController.getByExam().then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });

    });
    router.get("/:feature/all", function (req, res) {
        var globalController = common.getController(req.params.feature, req);

        globalController.getAll().then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });

    });
    router.get("/:feature/all-by-user", function (req, res) {
        var globalController = common.getController(req.params.feature, req);

        globalController.getAllByUser().then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });

    });
    router.get("/:feature/all-by-person", function (req, res) {
        var globalController = common.getController(req.params.feature, req);

        globalController.getAllByPerson().then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });

    });
    router.get("/:feature/all-by-company", function (req, res) {
        var globalController = common.getController(req.params.feature, req);

        globalController.getAllByCompany().then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });

    });

    router.post("/:feature/all-by-attributes", function (req, res) {
        var globalController = common.getController(req.params.feature, req);

        globalController.getAllByFilteredAttributes().then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });
    });

    router.delete("/:feature/:uuid", function (req, res) {
        var globalController = common.getController(req.params.feature, req);

        globalController.delete().then(function(response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });

    });

    router.get('/attribute/:feature', function (req, res) {
        var feature = req.params.feature;
        var uuid = req.params.uuid;

        var globalController = common.getController("attribute");

        globalController.getAttributeGroupByFeature(feature, uuid).then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });
    });

    router.get('/attribute/:feature/:uuid', function (req, res) {
        var feature = req.params.feature;
        var uuid = req.params.uuid;

        var globalController = common.getController("attribute");

        globalController.getAttributeGroupByFeature(feature, uuid).then(function (response) {
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
        var userController = common.getController("user", req);

        userController.getAllCompanies().then(function (response) {
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });

    });

    router.post('/aws/file/upload', function(req, res){
        var aws = require('../libs/aws');
        var file = req.files.file;

        aws.putObject(file).then(function(response){
            if (common.isError(response)) {
                res.json(401, response);
            } else {
                res.send(200, response);
            }
        });
    });

    return router;
};

// route middleware to make sure
function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated())
        res.json(common.getErrorObj("unauthorized"));
    else
        next();
}

