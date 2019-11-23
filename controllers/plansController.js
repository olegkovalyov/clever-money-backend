const Plan = require('../models/Plan');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const AppError = require('../utils/appError');
const httpStatus = require('http-status-codes');
const Joi = require('@hapi/joi');

const validatePlanData = (name, startDate, endDate) => {
  const validationSchema = Joi.object({
    name: Joi.string().min(2).max(20),
    startDate: Joi.date(),
    endDate: Joi.date(),
  });

  const validationResult = validationSchema.validate({
    name: name,
    startDate: startDate,
    endDate: endDate,
  });
  if (validationResult.error !== undefined) {
    let message = '';
    let errors = {};
    validationResult.error.details.forEach((error, i) => {
      message += error.message + '\n';
      errors[`${error.context.key}`] = error.context.value;
    });
    return new AppError(httpStatus.BAD_REQUEST, message, errors);
  }
  return null;
};

const validateId = (id) => {
  const validationSchema = Joi.object({
    id: Joi.string().alphanum().length(24),
  });

  const validationResult = validationSchema.validate({id: id});
  if (validationResult.error !== undefined) {
    let message = validationResult.error.details[0].message;
    const errors = {
      id: id,
    };
    return new AppError(httpStatus.BAD_REQUEST, message, errors);
  }
  return null;
};

exports.createPlan = asyncErrorHandler(async (req, res, next) => {
  let error = validatePlanData(req.body.name, req.body.startDate, req.body.endDate);
  if (error) {
    return next(error);
  }
  const plan = await Plan.create({
    name: req.body.name,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
  });
  res.send(plan);
});

exports.updatePlan = asyncErrorHandler(async (req, res, next) => {
  let error = validateId(req.params.id);
  if (error) {
    return next(error);
  }
  res.send('Update plan');
});

exports.deletePlan = asyncErrorHandler(async (req, res, next) => {
  let error = validateId(req.params.id);
  if (error) {
    return next(error);
  }
  res.send('Delete plan');
});

exports.getPlan = asyncErrorHandler(async (req, res, next) => {
  let error = validateId(req.params.id);
  if (error) {
    return next(error);
  }
  const plan = await Plan.findById(req.params.id);
  if (!plan) {
    next(new AppError(httpStatus.NOT_FOUND, 'Plan not found', {'_id': req.params.id}));
  }
  res.send(plan);
});

exports.getPlans = asyncErrorHandler(async (req, res, next) => {

  const pageNumber = req.query.pageNumber;
  const pageSize = req.query.pageSize;
  const planQuery = Plan.find();
  if (pageNumber !== undefined && pageSize !== undefined) {
    planQuery.skip((parseInt(pageNumber) - 1) * parseInt(pageSize)).limit(parseInt(pageSize));
  }
  const plans = await planQuery;
  res.status(200).send(plans);
});