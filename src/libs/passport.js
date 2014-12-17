// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

var common = require("../libs/common");

var userController = common.getController('user');

// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.data.uuid);
    });

    // used to deserialize the user
    passport.deserializeUser(function(uuid, done) {

            if (uuid===undefined)
                done(null);
            done(null, uuid);

    });

 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists



        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

				// if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password); // use the generateHash function in our user model

				// save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });

    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'





    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {

        userController.getOne({field:"email",value:email}).then( function(response) {
            var user = response.data;
            // if there are any errors, return the error before anything else
            if (response.error!==undefined)
                return done(response);

            // if the user is found but the password is wrong
            userController.validatePassword(user.password, password).then( function(response) {
                if (response.error!==undefined){
                    //common.sendMail({ "name":"LOGIN_ATTEMPT","recipients":recipients});

                    return done(response)
                }

              var companyController = common.getController("global")("company");

              companyController.getAllByUser(user.uuid).then( function(companyResponse) {

                //companyController.getByUser(user.uuid).then( function(companyResponse) {
                    if (companyResponse.error!==undefined){
                        return done(companyResponse)
                    }
                    if (companyResponse.data.length > 0){
                        user.companies = companyResponse.data;
                    }else{
                        user.companies = [];
                    }
                    return done(null, common.getResultObj(user));


                });



            });
        });


    }));

};
