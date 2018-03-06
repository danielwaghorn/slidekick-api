const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const User = require('../models/user.js');
const Slidedeck = require('../models/slidedeck.js');

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

    var token = req.body.token || req.param('token') || req.headers['authorization'];
    if (token === undefined) token = '';
    token = token.replace("Bearer ","");

    // Verify that token exists and is valid;
    if (token) {
        jwt.verify(token, req.app.get('secret'), function(err, decoded) {
            if (err) return res.status(403).json({ success: false, message: err.message });
            User.findById(decoded.id, (err, user) => {
                if (user) {
                    req.user = user;
                    return next();
                }

                res.status(403).send({
                  success: false,
                  message: 'Bad Token',
                });
            })
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'Bad Token',
        });
    }
});

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
 * New Slidedeck Route
 *
 * POST /api/slidedecks/new
 * Expects: JSON new slidedeck details object
 * Token: Yes
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.post('/new', function (req, res, next) {
    const s = new Slidedeck();

    s.ownerId   = req.body.ownerId;
    s.title     = req.body.title;
    s.slides    = 
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

    s.save(function(err, newSlidedeck) {
        if (err) {
            res.status(400);
            return res.json({
            success: false,
            message: err.message,
            });
        }

        res.header('NewSlidedeckId', newSlidedeck._id);
        res.status(201);
        res.json({
            success: true,
            message: 'New Slidedeck Created Successfully'
        });

    });

});

/**
 * Retrieve IDs of All Slidedecks for a User
 *
 * GET /api/slidedecks/list
 * Expects: N/A
 * Token: Yes
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.get('/list', function (req, res, next) {

    Slidedeck.find({ 'ownerId': req.user._id }, function (err, slidedecks) {
        if(err) {
            res.status(400);
            return res.json({
                success: false,
                message: err.message
            });
        }

        res.status(200);
        res.json({
            success: true,
            message: 'Retrieved Slidedecks for User',
            slidedecks: slidedecks
        });

    });

});

/**
 * Retrieve IDs of All Slidedecks for a User
 *
 * GET /api/slidedecks/retrieve
 * Expects: Token of desired slidedeck
 * Token: Yes
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.get('/retrieve', function (req, res, next) {

    console.log(req);
    id = req.headers.slidedeckid;
    console.log(id);

    Slidedeck.findById(id, function(err, slidedeck){
        if(err) {
            res.status(400);
            return res.json({
                success: false,
                message: err.message
            });
        }

        res.status(200);
        res.json({
            success: true,
            message: 'Retrieved Slidedeck',
            slidedeck: slidedeck
        });

    });

});

/**
 * Save Slidedeck (Update)
 *
 * GET /api/slidedecks/save
 * Expects: ID of target slidedeck
 * Token: Yes
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.post('/save', function (req, res, next) {

    id = req.headers.slidedeckid;

    Slidedeck.findById(id, function(err, slidedeck){
        if(err) {
            res.status(400);
            return res.json({
                success: false,
                message: err.message
            });
        }

        sidedeck.slides = req.body.slides;

        slidedeck.save(function (err, updatedSlidedeck) {
            if (err) return handleError(err);
            res.status(200);
            res.json({
                success: true,
                message: 'Saved Changes to Slidedeck',
                slidedeck: updatedSlidedeck
            });
        });

    });

});

/**
 * Delete Slidedeck
 *
 * GET /api/slidedecks/delete
 * Expects: ID of target slidedeck
 * Token: Yes
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.get('/delete', function (req, res, next) {

    id = req.headers.slidedeckid;

    Slidedeck.findById(id, function(err, slidedeck){
        if(err) {
            res.status(400);
            return res.json({
                success: false,
                message: err.message
            });s
        }

        slidedeck.remove(function (err) {
            if (err) return handleError(err);
            res.status(200);
            res.json({
                success: true,
                message: 'Deleted Slidedeck'
            });
        });

    });

});

/**
 * Rename Slidedeck
 *
 * GET /api/slidedecks/rename
 * Expects: ID of target slidedeck and new title
 * Token: Yes
 *
 * @param  {Object} req   Express request object
 * @param  {Object} res   Express response object
 * @param  {Function} next Closure for next request
 */
router.post('/rename', function (req, res, next) {

    if(req.body.slidedeckid == null || req.body.title == null){
        res.status(400);
        return res.json({
            success: false,
            message: 'Must supply Slidedeck ID and new title.',
        });
    }

    id = req.body.slidedeckid;

    Slidedeck.findById(id, function(err, slidedeck){
        if(err) {
            res.status(400);
            return res.json({
                success: false,
                message: 'Likely cause: slidedeck does not exist. Full error: ' + err.message
            });
        }

        slidedeck.title = req.body.title;

        slidedeck.save(function (err, updatedSlidedeck) {
            if (err) {
                res.status(400);
                return res.json({
                    success: false,
                    message: err.message,
                });
            }

            res.status(200);
            res.json({
                success: true,
                message: 'Renamed the Slidedeck',
                slidedeck: updatedSlidedeck
            });
        });

    });

});

module.exports = router;