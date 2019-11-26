const Plan = require('../models/Plan');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const AppError = require('../utils/appError');
const httpStatus = require('http-status-codes');
const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

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
    userId: mongoose.Types.ObjectId(),
  });
  res.send(plan);
});

exports.updatePlan = asyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  const error = validateId(id);
  if (error) {
    return next(error);
  }

  const plan = await Plan.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!plan) {
    return next(new AppError(httpStatus.NOT_FOUND, 'Error updating plan', {'_id': id}));
  }
  res.send(plan);
});

exports.deletePlan = asyncErrorHandler(async (req, res, next) => {
  let error = validateId(req.params.id);
  if (error) {
    return next(error);
  }
  res.send('Delete plan');
});

exports.getPlan = asyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  let error = validateId(id);
  if (error) {
    return next(error);
  }
  const plan = await Plan.findById(id);
  if (!plan) {
    next(new AppError(httpStatus.NOT_FOUND, 'Plan not found', {'_id': id}));
  }
  res.send(plan);
});

exports.getPlans = asyncErrorHandler(async (req, res, next) => {
  const planQuery = Plan.find();

  // pagination
  if (req.query.pageNumber !== undefined
      && req.query.pageSize !== undefined
  ) {
    const pageNumber = parseInt(req.query.pageNumber) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    planQuery.skip((pageNumber - 1) * pageSize).limit(pageSize);
  }

  // sorting
  const sortFields = ['name', 'startDate', 'endDate'];
  const directions = ['desc', 'asc'];
  if (req.query.sort !== undefined
      && req.query.direction !== undefined
      && sortFields.includes(req.query.sort)
      && directions.includes(req.query.direction)
  ) {
    const sortDirection = (req.query.direction === 'asc') ? 1 : -1;
    switch (req.query.sort) {
      case 'name':
        planQuery.sort({name: sortDirection});
        break;
      case 'startDate':
        planQuery.sort({startDate: sortDirection});
        break;
      case 'endDate':
        planQuery.sort({endDate: sortDirection});
        break;
    }
  } else {
    planQuery.sort({startDate: -1});
  }

  // execute query
  const plans = await planQuery;
  res.status(200).send(plans);
});