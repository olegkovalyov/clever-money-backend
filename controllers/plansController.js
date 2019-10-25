const Plan = require('../models/Plan');

exports.createPlan = async (req, res) => {
  const plan = await Plan.create({
    name: 'Oleh Kovalov',
  });
  res.send(plan);
};

exports.updatePlan = (req, res) => {
  res.send('Update plan');
};

exports.deletePlan = (req, res) => {
  res.send('Delete plan');
};

exports.getPlan = (req, res) => {
  res.send('Get plan');
};

exports.getPlans = (req, res) => {
  res.send('Get all plans');
};