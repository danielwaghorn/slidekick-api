/* 
 * slidekick-api -> app.js
 * ----------------------------------------------------------------------------------------------------
 * 
 * Author(s):
 * Project: slidekick-api
 * Version: 1.0
 * Date: 16th February 2018
 * 
 */

/* 
 * Requirements, Definitions and Globals
 * ----------------------------------------------------------------------------------------------------
 */

// Requirements -> Global
var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var db = require('mongodb').Db;
var conn_url = "mongodb://localhost:27017/admin"

// Requirements -> Auth
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User = require('./models/user'); // get our mongoose model

// Requirements -> Routing
var index = require('./routes/index');
var users = require('./routes/users');
var insert = require('./config/insert');
var view = require('./config/view');

/* 
 * MongoClient                                                                                    [SEB]
 * ----------------------------------------------------------------------------------------------------
 */

MongoClient.connect(conn_url, function (err, db) {
  if (err) throw err;

  module.exports = function (socket) {
    socket.on('test', function () {
  });

    socket.on('read_db', function () {
      db.collection('users').find().toArray(function (err, results) {
      socket.emit('results', results);
      });
    });
  }
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', index);
  app.use('/user', users);
  app.use('/insert', insert);
  app.use('/view', view);

  app.post('/add_entry', function (req, res){
    addUser(req.body);
    res.redirect('/');
  })

  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
  });
});

module.exports = app;

 /*  
 * JWT                                                                                         [RONNIE]
 * ----------------------------------------------------------------------------------------------------
 */

// Congiguration
var port = process.env.PORT || 3010;
mongoose.connect(config.database);
app.set('secret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

// Routing
var apiRoutes = express.Router(); 

// Authentication
apiRoutes.post('/authenticate', function(req, res) {

	User.findOne({email: req.body.email}, function(err, user) {
		if (err) throw err;

		if (!user) {
			res.json({ success: false, message: 'User not found.' });
    }
    else if (user) {

      var pwMatch = user.comparePassword(req.body.password, function(err, pwMatch) {
        if (err) throw err;
        
        if(pwMatch){
          var payload = {
            admin: user.admin	
          }
          
          var token = jwt.sign(payload, app.get('secret'), {
            expiresIn: 43200 // 12 hours
          });
  
          res.json({
            success: true,
            message: 'Authentication successful!',
            token: token
          });
        }
        else{
          res.json({ success: false, message: 'Authentication failure!' });
        }
      });
		}
	});
});

apiRoutes.use(function(req, res, next) {

	var token = req.body.token || req.param('token') || req.headers['x-access-token'];

	if (token) {
		jwt.verify(token, app.get('secret'), function(err, decoded) {			
			if (err) {
				return res.json({ success: false, message: 'Could not authenticate.' });		
			} else {
				req.decoded = decoded;	
				next();
			}
		});

  }
  else {
		return res.status(403).send({ 
			success: false, 
			message: 'No token'
		});
	}
	
});

app.use('/api', apiRoutes);

// Registration
function addUser(newUserDetails){
  var newUser = new User({ 
    forename: newUserDetails.forename, 
    surname: newUserDetails.surname,
    email: newUserDetails.email,
		password: newUserDetails.password,
		admin: false
  });
  
	newUser.save(function(err) {
	  if (err){
      console.log(err);
    }
    else{
      console.log('Created new user!');
    }
  });
}

// Launch
app.listen(port);
console.log('slidekick-api is running...');
