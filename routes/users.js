const express = require('express');
const router = express.Router();
const app = express();

const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const User = require('../models/user.js');

/**
 * Registration Route
 *
 * POST /api/user/register
 * Expects: JSON user object
 * Token: No
 */
router.post('/register', function (req, res, next) {
  const u = new User();

  u.forename  = req.body.forename;
  u.surname   = req.body.surname;
  u.email     = req.body.email;
  u.password  = req.body.password;
  u.admin     = false;

  u.save(function(err) {
    if (err) {
      res.status(400);
      return res.json({
        status: false,
        message: err.message,
      });
    }

    res.status(201);
    res.json({
      status: true,
      message: 'User Registration Successful',
    });
  });

  // Token Middleware
  router.use(function(req, res, next) {

    var token = req.body.token || req.param('token') || req.headers['x-access-token'];

    // Ignore token requirement for registration and login
    const unprotectedRoutes = ['/auth/register', '/auth/login'];
    if (unprotectedRoutes.indexOf(req.path) !== -1) return next();

    if (token) {
      jwt.verify(token, app.get('secret'), function(err, decoded) {     
        if (err) {
          return res.json({ success: false, message: 'Could not authenticate.' });    
        }
          
        req.decoded = decoded;  
        next();
      });
    } else {
      return res.status(403).send({ 
        success: false, 
        message: 'No token'
      });
    }
  });
});

module.exports = router;
