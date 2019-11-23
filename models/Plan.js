const mongoose = require('mongoose');

const types = mongoose.Schema.Types;
const planSchema = new mongoose.Schema({
  name: {
    type: types.String,
    unique: true,
    required: [true, `'name' is required`],
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
});

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;