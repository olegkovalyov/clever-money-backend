const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: String,
});

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;