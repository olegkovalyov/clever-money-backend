const mongoose = require('mongoose');

const types = mongoose.Schema.Types;
const planSchema = new mongoose.Schema({
  name: {
    type: types.String,
    required: [true, `'name' is required`],
    minlength: 3,
    maxlength: 50,
    trim: true,
  },
  startDate: {
    type: types.Date,
    required: [true, `'startDate' is required`],
  },
  endDate: {
    type: types.Date,
    required: [true, `'endDate' is required`],
  },
  active: {
    type: types.Boolean,
    default: true,
  },
  userId: {
    type: types.ObjectId,
    required: [true, `'userId' is required`],
  },
}, {timestamps: true});

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;