const jwtMiddleware = require('./middleware/auth')
const _loginError = require('./middleware/loginError')

const jwt = require('jsonwebtoken') // used to create, sign, and verify tokens

const express = require('express')
const router = express.Router()

const User = require('../models/user.js')

router.use(jwtMiddleware);

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
  const u = new User()

  u.forename = req.body.forename
  u.surname = req.body.surname
  u.email = req.body.email
  u.password = req.body.password
  u.admin = false

  u.save(function (err) {
    if (err) {
      res.status(400)
      return res.json({
        success: false,
        message: err.message
      })
    }

    // Return response with JWT token on header
    const token = jwt.sign(u.toJSON(), req.app.get('secret'), { algorithm: 'HS256'})
    res.header('Authorization', `Bearer ${token}`)
    res.status(201)
    res.json({
      success: true,
      message: 'User Registration Successful',
      user: u.toJSON()
    })
  })
})

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
    if (!u) {
      if (err === null) {
        err = {}
        err.message = 'Invalid credentials, please try again.'
      }
      return _loginError(req, res, next, err)
    }

    // Verify that their password is valid;
    u.validatePassword(req.body.password, function (error, isValid) {
      if (isValid) {
        // Valid Password
        const token = jwt.sign(u.toJSON(), req.app.get('secret'), { algorithm: 'HS256'})
        res.header('Authorization', `Bearer ${token}`)
        res.json({ success: true, user: u.toJSON() })
      } else {
        // Invalid Password
        if (!(error instanceof Object)) error = {}
        error.message = 'Invalid credentials'
        return _loginError(req, res, next, error)
      }
    })
  })
})

router.get('/me', function (req, res, next) {
  if (!req.user) return _loginError()
  res.json({ user: req.user.toJSON() })
})

router.post('/refresh', function (req, res, next) {
  const token = jwt.sign(req.user.toJSON(), req.app.get('secret'), { algorithm: 'HS256'})
  res.header('Authorization', `Bearer ${token}`)
  res.json({ user: req.user.toJSON() })
})

module.exports = router
