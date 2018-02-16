var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var db = require('mongodb').Db;
var conn_url = "mongodb://localhost:27017/admin"
//var mongoose = require('mongoose');

var index = require('./routes/index');
var users = require('./routes/users');
var insert = require('./config/insert');
var view = require('./config/view');

var app = express();

MongoClient.connect(conn_url, function (err, db) {
  if (err) throw err;

  module.exports = function (socket) {
    socket.on('test', function () {
      console.log('Got emit from client!');
    });

    socket.on('read_db', function () {
      console.log('Got emit from client!');
      db.collection('test1').find().toArray(function (err, results) {
      //console.log(results)
      socket.emit('results',results);
      });
    });
  }
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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
    //console.log(req.body);
    db.collection('test1').save(req.body, function (err, result) {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/')
    })
  })

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  //db.close();
});

module.exports = app;
