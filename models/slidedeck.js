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
    backgroundColor: { type: String, required: true },
    elements: [ElementSchema]
});

/* 
 * Presentation                                                                                   
 * ----------------------------------------------------------------------------------------------------
 */

var SlidedeckSchema = new Schema({
    ownerId: { type: String, required: true },
    title: { type: String, required: true },
    slides: [SlideSchema]
});

SlidedeckSchema.pre('save', function(next) {
    var slidedeck = this;

    SlidedeckModel.findOne({ownerId: slidedeck.ownerId, title: slidedeck.title}, function(err, slidedeckExists){
        if(slidedeckExists){
            return next(new Error('This user already has a presentation with this title.'));
            console.log('User + title already exists!');
        }
        else{
            next();
        }
    });
});

var SlidedeckModel = mongoose.model('Slidedeck', SlidedeckSchema);
module.exports = mongoose.model('Slidedeck', SlidedeckSchema);