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
  res.status(401);
  return res.json({
    success: false,
    message: 'Please supply valid credentials',
    error: err.message
  })
}

module.exports = _loginError
