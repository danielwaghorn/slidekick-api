const jwtMiddleware = require('./middleware/auth')

const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const User = require('../models/user.js')
const Presentation = require('../models/presentation')

const handleError = error => {
  return console.error(error)
}

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
router.use(jwtMiddleware)

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
router.post('/', function (req, res, next) {
  const s = new Presentation()

  s.ownerId = req.user.id
  s.title = req.body.title
  s.slides = req.body.slides

  s.save(function (err, newPresentation) {
    if (err) {
      res.status(400)
      return res.json({
        success: false,
        message: err.message
      })
    }

    res.header('Location', `/api/presentations/${newPresentation._id}`)
    res.status(201)
    res.json({
      success: true,
      message: 'New Presentation Created Successfully',
      presentation: newPresentation.toJSON()
    })
  })
})

/**
 * Retrieve IDs of All Presentations for a User
 *
 * GET /api/presentations
 * Expects: N/A
 * Token: Yes
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.get('/', function (req, res, next) {
  Presentation.find({ 'ownerId': mongoose.Types.ObjectId(req.user.id) }, function (err, presentations) {
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
      presentations: presentations.map(p => p.tolistJSON())
    })
  })
})

/**
 * Save Presentation (Update)
 *
 * PUT /api/presentations/:id
 * Expects: ID of target presentation
 * Token: Yes
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.put('/:id', function (req, res, next) {
  id = req.params.id

  Presentation.findById(id, function (err, presentation) {
    if (err) {
      res.status(400)
      return res.json({
        success: false,
        message: err.message
      })
    }

    presentation.title = req.body.title
    if (req.body.slides) presentation.slides = req.body.slides

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
 * Get presentation
 *
 * GET /api/presentations/:id
 * Expects: ID of target presentation
 * Token: Yes
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.get('/:id', function (req, res, next) {
  id = req.params.id

  Presentation.findById(id, function (err, presentation) {
    if (err) {
      res.status(400)
      return res.json({
        success: false,
        message: err.message
      })
    }

    if (presentation) {
      res.status(200)
      res.json({
        success: true,
        message: 'Presentation Retrieved Successfully',
        presentation: presentation.toJSON()
      })
    } else {
      res.status(404)
      res.json({
        success: false,
        message: `No Presentation found for id ${id}`
      })
    }
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
router.delete('/:id', function (req, res, next) {
  id = req.params.id

  Presentation.findById(id, function (err, presentation) {
    if (err) {
      res.status(400)
      return res.json({
        success: false,
        message: err.message
      })
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

module.exports = router
