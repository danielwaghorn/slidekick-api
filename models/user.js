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
    var user = this;

    UserModel.findOne({email: user.email}, function(err, userExists) {
        if(userExists){
            return next(new Error('A user already exists for this email address!'));
        }
        else{
            if (!user.isModified('password')) return next();

            bcrypt.genSalt(SALT_WF, function(err, salt) {
                if (err) return next(err);
        
                bcrypt.hash(user.password, salt, function(err, hash) {
                    if (err) return next(err);
                    user.password = hash;
                    next();
                });
            });
        }
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var UserModel = mongoose.model('User',UserSchema);

module.exports = mongoose.model('User', UserSchema);