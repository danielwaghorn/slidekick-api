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
  type: { type: String, validate: [validateElement, 'Not a valid element.'], required: true },
  properties: { type: Object, required: true }
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

var PresentationModel = mongoose.model('Presentation', PresentationSchema)

PresentationModel.prototype.tolistJSON = function () {
  return {
    id: this._id,
    title: this.title
  }
}

if (!PresentationSchema.options.toJSON) PresentationSchema.options.toJSON = {}
PresentationSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id
  delete ret._id
  return ret
}

module.exports = PresentationModel
