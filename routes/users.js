const express = require('express');
const router = express.Router();

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
        success: false,
        message: err.message,
      });
    }

    // Return response with JWT token on header
    const token = jwt.sign(u.toJSON(), req.app.get('secret'), { algorithm: 'HS256'});
    res.header('Authorization', `Bearer ${token}`);
    res.status(201);
    res.json({
      success: true,
      message: 'User Registration Successful',
    });
  });

  /**
   * Token Middleware
   *
   * Validates a JWT token presented on Authorization
   * header.
   * 
   * @param  {Object} req   Express request object
   * @param  {Object} res   Express response object
   * @param  {Function} next Closure for next request
   * @return {void}
   */
  router.use(function(req, res, next) {

    var token = req.body.token || req.param('token') || req.headers['Authorization'];

    // Ignore token requirement for registration and login
    const unprotectedRoutes = ['/auth/register', '/auth/login'];
    if (unprotectedRoutes.indexOf(req.path) !== -1) return next();

    // Verify that token exists and is valid;
    if (token) {
      jwt.verify(token, req.app.get('secret'), function(err, decoded) {     
        if (err) return res.json({ success: false, message: err.message });
        req.decoded = decoded;  
        next();
      });
    } else {
      return res.status(403).send({ 
        success: false, 
        message: 'Bad Token',
      });
    }
  });
});

module.exports = router;
