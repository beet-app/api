var express        = require('express');
var bodyParser     = require('body-parser');
var cookieParser   = require('cookie-parser');
var morgan         = require('morgan');
var passport       = require('passport');
var flash 	       = require('connect-flash');
var methodOverride = require('method-override');
var session        = require('express-session');
var cors           = require('express-cors');



var app        = express();

app.use(cors({
   allowedOrigins: [
       'http://127.0.0.1:9000',
       'http://201.87.228.140:9000',
       'http://177.72.244.6',
       'http://beet.cc',
       'http://192.168.16.58:9000'

   ]
}));


var port = process.env.PORT || 1313; 		// set our port// load the config


var database = require('./config/database');


app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser());
app.use(methodOverride());

// required for passport
app.use(session({ secret: '2014beet2014' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./config/passport')(passport);

var router         = require('./app/routes')(app, passport);

app.use('/api', router);


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);



