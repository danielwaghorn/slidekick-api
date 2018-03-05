/* 
 * slidekick-api -> models -> user.js
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
var bcrypt = require('bcrypt');

SALT_WF = 8;

var UserSchema = new Schema({
	forename: { type: String, required: true },
	surname: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	admin: { type: Boolean }
});

UserSchema.pre('save', function(next) {
    UserModel.findOne({ email: this.email }, function(err, userExists) {
        if (userExists) {
            return next(new Error('A user already exists for this email address!'));
        } else {
            if (!this.isModified('password')) return next();

            bcrypt.genSalt(SALT_WF, function(err, salt) {
                if (err) return next(err);
        
                bcrypt.hash(this.password, salt, function(err, hash) {
                    if (err) return next(err);
                    this.password = hash;
                    next();
                });
            });
        }
    });
});

if (!UserSchema.options.toJSON) UserSchema.options.toJSON = {};
UserSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.password;
  delete ret.__v;
  return ret;
}

UserSchema.methods.validatePassword = function(candidatePassword, fn) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return fn(err, isMatch);
        fn(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);
