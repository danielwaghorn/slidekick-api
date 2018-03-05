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
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

SALT_WF = 8;

var UserSchema = new Schema({
	forename: { type: String, required: true },
	surname: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	admin: { type: Boolean }
});

UserSchema.plugin(uniqueValidator);

UserSchema.pre('save', function(next) {
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WF, function(err, salt) {
      if (err) return next(err);

      // hash the password using our new salt
      bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) return next(err);

          // override the cleartext password with the hashed one
          user.password = hash;
          next();
      });
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
