// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
//var User       		= require('../app/models/user');
//var Company         = require('../app/controllers/company');
var pg   = require('pg');

// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
                    
            done(err, user);
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

        var client = new pg.Client({
            user: 'bdeqxewfggybjt',
            password: 'J_toI-s6b0BPyFK6n3UFto8HZO',
            database: 'd1l0hv7prm6i58',
            host: 'ec2-54-197-249-212.compute-1.amazonaws.com',
            port: 5432,
            ssl:true
        });
        client.connect();
        //query is executed once connection is established and
        //PostgreSQL server is ready for a query
        var query = client.query("SELECT email FROM user");
        query.on('row', function(row) {
            return done(row.name);
        });
        query.on('end', client.end.bind(client)); //disconnect client manually




    }));

};
