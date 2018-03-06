/* 
 * slidekick-api -> models -> slidedeck.js
 * ----------------------------------------------------------------------------------------------------
 * 
 * Author(s):
 * Project: slidekick-api
 * Version: 1.0
 * Date: 21st February 2018
 * 
 */

var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

/* 
 * Elements                                                                                   
 * ----------------------------------------------------------------------------------------------------
 */

var validateElement = function (elementString) {
    return ['TEXT', 'IMAGE', 'SHAPE'].includes(elementString);
};

var ElementSchema = new Schema({
    type: { type: String, validate: [validateElement, 'Not a valid element.'], required: true }
});

/* 
 * Slides                                                                                   
 * ----------------------------------------------------------------------------------------------------
 */

var SlideSchema = new Schema({
    backgroundColour: { type: String, required: true },
    elements: [ElementSchema]
});

/* 
 * Slidedeck                                                                                   
 * ----------------------------------------------------------------------------------------------------
 */

var SlidedeckSchema = new Schema({
    ownerId: { type: String, required: true },
    title: { type: String, required: true },
    slides: [SlideSchema]
});

SlidedeckSchema.plugin(uniqueValidator);

SlidedeckSchema.pre('save', function(next) {
    var slidedeck = this;

    SlidedeckModel.findOne({ownerId: slidedeck.ownerId, title: slidedeck.title}, function(err, slidedeckExists){
        if(slidedeckExists){
            return next(new Error('This user already has a presentation with this title.'));
        }
        else{
            next();
        }
    });
});

var SlidedeckModel = mongoose.model('Slidedeck', SlidedeckSchema);
module.exports = SlidedeckModel;