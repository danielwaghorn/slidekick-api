/*
 * slidekick-api -> app.js
 * ----------------------------------------------------------------------------------------------------
 *
 * Author(s):
 * Project: slidekick-api
 * Version: 1.0
 * Date: 21st February 2018
 *
 */

/*
 * Requirements, Definitions and Globals
 * ----------------------------------------------------------------------------------------------------
 */

// Requirements -> Global
var express = require('express')
var app = express()
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var morgan = require('morgan')
var MongoClient = require('mongodb').MongoClient
var mongoose = require('mongoose')
var db = require('mongodb').Db
var conn_url = 'mongodb://localhost:27017/admin'

// Requirements -> Auth
var config = require('./config') // get our config file

// Requirements -> Routing
var index = require('./routes/index')
var users = require('./routes/users')
var presentations = require('./routes/presentations')
var insert = require('./config/insert')
var view = require('./config/view')

/*
 * MongoClient
 * ----------------------------------------------------------------------------------------------------
 */

MongoClient.connect(conn_url, function (err, db) {
  if (err) throw err

  module.exports = function (socket) {
    socket.on('test', function () {
    })

    socket.on('read_db', function () {
      db.collection('users').find().toArray(function (err, results) {
        socket.emit('results', results)
      })
    })
  }
  // view engine setup
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'jade')

  app.use(logger('dev'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(cookieParser())
  app.use(express.static(path.join(__dirname, 'public')))

  app.use('/', index)
  app.use('/user', users)
  app.use('/insert', insert)
  app.use('/view', view)

  app.post('/add_entry', function (req, res) {
    addUser(req.body)
    res.redirect('/')
  })

  app.use(function (req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  app.use(function (err, req, res, next) {
     // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}
    // render the error page
    res.status(err.status || 500)
    res.render('error')
  })
})

module.exports = app

 /*
 * JWT
 * ----------------------------------------------------------------------------------------------------
 */

// Configuration
var port = process.env.PORT || 3010
mongoose.connect(config.database)
app.set('secret', config.secret)

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(morgan('dev'))

// Routing
app.use('/api/user', users)
app.use('/api/spresentations', presentations)

// Launch
app.listen(port)
console.log('slidekick-api is running...')
