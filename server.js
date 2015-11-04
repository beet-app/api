var express        = require('express');
var bodyParser     = require('body-parser');
var cookieParser   = require('cookie-parser');
var morgan         = require('morgan');
var passport       = require('passport');
var flash 	       = require('connect-flash');
var methodOverride = require('method-override');
var session        = require('express-session');
var cors           = require('express-cors');


var app = express();

var common = require("./src/libs/common");

app.use(cors(common.getConfig('cors')));

var port = process.env.PORT || 1313; 		// set our port// load the config

var database = common.getConfig('database');

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;


app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser());
app.use(methodOverride());

// required for passport
app.use(session({ secret: '2014beet2014' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

common.getLib('passport')(passport);

var router = require('./src/routes/main_route')(app, passport);

app.use('/api', router);


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);



