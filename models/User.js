const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
  active: {
    type: types.Boolean,
    default: true,
  },
}, {timestamps: true});

userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
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