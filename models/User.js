const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');

const types = mongoose.Schema.Types;
const userSchema = new mongoose.Schema({
  name: {
    type: types.String,
    required: [true, 'name is required'],
    minlength: 2,
    maxlength: 50,
    trim: true,
  },
  email: {
    type: types.String,
    required: [true, 'email is required'],
    unique: true,
    minlength: 3,
    maxlength: 20,
    trim: true,
  },
  password: {
    type: types.String,
  },
  passwordChangedAt: types.Date,
  passwordResetToken: {
    type: types.String,
    default: null,
  },
  passwordResetExpires: {
    type: types.Date,
    default: null,
  },
  active: {
    type: types.Boolean,
    default: true,
  },
}, {timestamps: true});

userSchema.pre('save', async function(next) {
  try {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, parseInt(process.env.SALT_ROUNDS));
      if (!this.isNew) {
        this.passwordChangedAt = Date.now();
      }
    }
    next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60000;
  return resetToken;
};

userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.createJsonWebToken = async function() {
  const payload = {
    id: this._id,
    name: this.name,
    email: this.email,
  };
  const token = await promisify(jwt.sign)(payload, process.env.JWT_SECRET, {expiresIn: process.env.JTW_EXPIRATION});
  return token;
};

userSchema.methods.isResetTokenValid = function() {
  return this.passwordResetExpires.getTime() >= Date.now();
};

userSchema.methods.changedPasswordAfter = function(jwtCreatedTimestamp) {
  if (this.passwordChangedAt) {
    const timestampChangedPassword = Math.round(this.passwordChangedAt.getTime() / 1000);
    if (timestampChangedPassword > jwtCreatedTimestamp) {
      return true;
    }
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
