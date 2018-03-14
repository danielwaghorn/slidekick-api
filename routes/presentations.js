const express = require('express')
const router = express.Router()

const jwt = require('jsonwebtoken') // used to create, sign, and verify tokens

const User = require('../models/user.js')
const Presentation = require('../models/presentation')

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
router.use(function (req, res, next) {
  var token = req.body.token || req.param('token') || req.headers['authorization']
  if (token === undefined) token = ''
  token = token.replace('Bearer ', '')

    // Verify that token exists and is valid;
  if (token) {
    jwt.verify(token, req.app.get('secret'), function (err, decoded) {
        if (err) return res.status(403).json({ success: false, message: err.message })
        User.findById(decoded.id, (err, user) => {
          if (user) {
                req.user = user
                return next()
              }

          res.status(403).send({
                success: false,
                message: 'Bad Token'
              })
        })
      })
  } else {
    return res.status(403).send({
        success: false,
        message: 'Bad Token'
      })
  }
})

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
  res.status(400)
  return res.json({
    success: false,
    message: 'Please supply valid credentials',
    error: err.message
  })
}

/**
 * New Presentation Route
 *
 * POST /api/presentations/new
 * Expects: JSON new presentation details object
 * Token: Yes
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.post('/new', function (req, res, next) {
  const s = new Presentation()

  s.ownerId = req.body.ownerId
  s.title = req.body.title
  s.slides =
  [
      {
        backgroundColour: '#FFFFFF',
        elements: [
          {
            id: 0,
            type: 'TEXT',
            properties: {
              x: '30px',
              y: '30px',
              fill: '#000000',
              fontFamily: 'Verdana',
              fontSize: '20px',
              content: 'Title goes here'
            }
          }
        ]
      }
  ]

  s.save(function (err, newPresentation) {
    if (err) {
      res.status(400)
      return res.json({
          success: false,
          message: err.message
        })
    }

    res.header('NewPresentationId', newPresentation._id)
    res.status(201)
    res.json({
      success: true,
      message: 'New Presentation Created Successfully'
    })
  })
})

/**
 * Retrieve IDs of All Presentations for a User
 *
 * GET /api/presentations/list
 * Expects: N/A
 * Token: Yes
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.get('/list', function (req, res, next) {
  Presentation.find({ 'ownerId': req.user._id }, function (err, presentations) {
    if (err) {
      res.status(400)
      return res.json({
          success: false,
          message: err.message
        })
    }

    res.status(200)
    res.json({
      success: true,
      message: 'Retrieved Presentations for User',
      presentations: presentations
    })
  })
})

/**
 * Retrieve IDs of All Presentations for a User
 *
 * GET /api/presentations/retrieve
 * Expects: Token of desired presentation
 * Token: Yes
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.get('/retrieve', function (req, res, next) {
  console.log(req)
  id = req.headers.presentationid
  console.log(id)

  Presentation.findById(id, function (err, presentation) {
    if (err) {
        res.status(400)
        return res.json({
          success: false,
          message: err.message
        })
      }

    res.status(200)
    res.json({
        success: true,
        message: 'Retrieved Presentation',
        presentation: presentation
      })
  })
})

/**
 * Save Presentation (Update)
 *
 * GET /api/presentations/save
 * Expects: ID of target presentation
 * Token: Yes
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.post('/save', function (req, res, next) {
  id = req.headers.presentationid

  Presentation.findById(id, function (err, presentation) {
    if (err) {
        res.status(400)
        return res.json({
          success: false,
          message: err.message
        })
      }

    presentation.slides = req.body.slides

    presentation.save(function (err, updatedPresentation) {
        if (err) return handleError(err)
        res.status(200)
        res.json({
            success: true,
            message: 'Saved Changes to presentation',
            presentation: updatedPresentation
          })
      })
  })
})

/**
 * Delete presentation
 *
 * GET /api/presentations/delete
 * Expects: ID of target presentation
 * Token: Yes
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.get('/delete', function (req, res, next) {
  id = req.headers.presentationid

  Presentation.findById(id, function (err, presentation) {
    if (err) {
        res.status(400)
        return res.json({
          success: false,
          message: err.message
        }); s
      }

    presentation.remove(function (err) {
        if (err) return handleError(err)
        res.status(200)
        res.json({
          success: true,
          message: 'Deleted presentation'
        })
      })
  })
})

/**
 * Rename presentation
 *
 * GET /api/presentations/rename
 * Expects: ID of target presentation and new title
 * Token: Yes
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.post('/rename', function (req, res, next) {
  if (req.body.presentationid == null || req.body.title == null) {
    res.status(400)
    return res.json({
      success: false,
      message: 'Must supply presentation ID and new title.'
    })
  }

  id = req.body.presentationid

  Presentation.findById(id, function (err, presentation) {
    if (err) {
        res.status(400)
        return res.json({
          success: false,
          message: 'Likely cause: presentation does not exist. Full error: ' + err.message
        })
      }

    presentation.title = req.body.title

    presentation.save(function (err, updatedPresentation) {
        if (err) {
            res.status(400)
            return res.json({
              success: false,
              message: err.message
            })
          }

        res.status(200)
        res.json({
            success: true,
            message: 'Renamed the presentation',
            presentation: updatedPresentation
          })
      })
  })
})

module.exports = router
