/*
 * slidekick-api -> models -> presentation.js
 * ----------------------------------------------------------------------------------------------------
 *
 * Author(s):
 * Project: slidekick-api
 * Version: 1.0
 * Date: 21st February 2018
 *
 */

var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')
var Schema = mongoose.Schema

/*
 * Elements
 * ----------------------------------------------------------------------------------------------------
 */

var validateElement = function (elementString) {
  return ['TEXT', 'IMAGE', 'SHAPE'].includes(elementString)
}

var ElementSchema = new Schema({
  type: { type: String, validate: [validateElement, 'Not a valid element.'], required: true }
})

/*
 * Slides
 * ----------------------------------------------------------------------------------------------------
 */

var SlideSchema = new Schema({
  backgroundColour: { type: String, required: true },
  elements: [ElementSchema]
})

/*
 * Presentation
 * ----------------------------------------------------------------------------------------------------
 */

var PresentationSchema = new Schema({
  ownerId: { type: String, required: true },
  title: { type: String, required: true },
  slides: [SlideSchema]
})

PresentationSchema.plugin(uniqueValidator)

PresentationSchema.pre('save', function (next) {
  var presentation = this

  PresentationModel.findOne({ownerId: presentation.ownerId, title: presentation.title}, function (err, presentationExists) {
    if (presentationExists) {
        return next(new Error('This user already has a presentation with this title.'))
      } else {
        next()
      }
  })
})

var PresentationModel = mongoose.model('Presentation', PresentationSchema)

PresentationModel.prototype.tolistJSON = function () {
  return {
    id: this._id,
    title: this.title
  }
}

module.exports = PresentationModel
