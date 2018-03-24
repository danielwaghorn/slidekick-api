const jwt = require('jsonwebtoken') // used to create, sign, and verify tokens
const User = require('../../models/user.js')

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

const jwtMiddleware = function (req, res, next) {
  // Ignore token requirement for registration and login
  if (['/register', '/login'].indexOf(req.path) !== -1) {
    return next()
  }

  var token = req.body.token || req.params.token || req.headers['authorization']
  if (token === undefined) {
    token = ''
  }
  token = token.replace('Bearer ', '')

  // Verify that token exists and is valid;
  if (token) {
    jwt.verify(token, req.app.get('secret'), function (err, decoded) {
      if (err) return res.status(401).json({ success: false, message: err.message })
      User.findById(decoded.id, (error, user) => {
        if (user) {
          req.user = user
          return next()
        } else if (error) {
          res.status(401).send({
            success: false,
            message: 'An error occurred'
          })
        }

        res.status(401).send({
          success: false,
          message: 'Bad Token'
        })
      })
    })
  } else {
    return res.status(401).send({
      success: false,
      message: 'Bad Token'
    })
  }
}

module.exports = jwtMiddleware
