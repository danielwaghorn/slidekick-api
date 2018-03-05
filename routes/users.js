const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const User = require('../models/user.js');

/**
 * _loginError
 *
 * Default response for a login failure.
 * 
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
const _loginError = (req, res, next, err) => {
  res.status(400);
  return res.json({
    success: false,
    message: 'Please supply valid credentials',
    error: err.message,
  });
}

/**
 * Registration Route
 *
 * POST /api/user/register
 * Expects: JSON user object
 * Token: No
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
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
});

/**
 * Login Route
 *
 * POST /api/user/register
 * Expects: JSON user credentials { email, password }
 * Token: No
 * 
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.post('/login', function (req, res, next) {
  // Try to find a corresponding User object
  User.findOne({ email: req.body.email }).exec((err, u) => {

    // Verify that their password is valid;
    u.validatePassword(req.body.password, function (error, isValid) {
      if (isValid) {
        // Valid Password
        const token = jwt.sign(u.toJSON(), req.app.get('secret'), { algorithm: 'HS256'});
        res.header('Authorization', `Bearer ${token}`);
        res.json({ success: true, user: u.toJSON() });
      } else {
        // Invalid Password
        return _loginError(req, res, next, error);
      }
    });
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

module.exports = router;
