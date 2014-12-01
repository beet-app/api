// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

var common   = require('./common');

var userController = require('./../controllers/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.uuid);
    });

    // used to deserialize the user
    passport.deserializeUser(function(uuid, done) {
        userController.getOne(uuid).then(function(user) {
            if (user===null)
                done(null);
            done(null, user);
        });
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
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        //var conString = "postgres://bdeqxewfggybjt:J_toI-s6b0BPyFK6n3UFto8HZO@ec2-54-197-249-212.compute-1.amazonaws.com:5432/d1l0hv7prm6i58";
                           //postgres://bdeqxewfggybjt:J_toI-s6b0BPyFK6n3UFto8HZO@ec2-54-197-249-212.compute-1.amazonaws.com:5432/d1l0hv7prm6i58





        userController.validateEmail(email).then( function(user) {

            // if there are any errors, return the error before anything else
            if (user===null)
                return done(null);

            // if the user is found but the password is wrong

            userController.validatePassword(user.password, password).then( function(bln) {
                if (!bln){
                    var mandrill = require('mandrill-api/mandrill');
                    var mandrill_client = new mandrill.Mandrill('1qxQPud-ZKI4a-7PnW1Q0w');

                    // the sender email will look like 'John Doe <notification@sampleapp.com>'
                    var fromEmail = 'support@beet.cc';

                    // by forming this address this way, when users reply, they will see "Reply to Comment"
                    // and not necessesarily the weird looking email address (that, of course, will depend
                    // on the user's email client)
                    var replyToEmail = "Reply to Comment <support@replies.sampleapp.com>";

                    // it's always a good idea to add a tag to similar messages, that will let you filter
                    // them out easily in mandrill's admin portal
                    var tags = [ "sample-messages" ];

                    //common.sendMail({ "name":"LOGIN_ATTEMPT","recipients":recipients});

                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
                }

                // all is well, return successful user



                return done(null, user);
            });
        });


    }));

};
