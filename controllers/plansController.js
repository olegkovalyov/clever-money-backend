const httpStatus = require('http-status-codes');
const Plan = require('../models/Plan');
const AppError = require('../classes/AppError');
const DataValidator = require('../classes/DataValidator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const errorConstants = require('../constants/Error');

exports.createPlan = async (req, res, next) => {
  try {
    const dataValidator = new DataValidator();
    if (!dataValidator.validateDate('startDate', req.body.startDate)
        || !dataValidator.validateDate('endDate', req.body.endDate)
        || !dataValidator.validateName(req.body.name)
    ) {
      return next(dataValidator.getErrorObject());
    }
    let decodedData = jwt.decode(req.headers.authorization.split(' ')[1]);
    const plan = await Plan.create({
      name: req.body.name,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      userId: decodedData.id,
    });
    res.send({
      status: 'success',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePlan = async (req, res, next) => {
  try {
    const dataValidator = new DataValidator();
    if (!dataValidator.validateMongoId(req.params.id)
        || !dataValidator.validateDate('startDate', req.body.startDate)
        || !dataValidator.validateDate('endDate', req.body.endDate)
        || !dataValidator.validateName(req.body.name)
    ) {
      return next(dataValidator.getErrorObject());
    }

    let decodedData = jwt.decode(req.headers.authorization.split(' ')[1]);
    const updatedData = _.pick(req.body, ['name', 'startDate', 'endDate']);
    updatedData.userId = decodedData.id;
    const plan = await Plan.findOneAndUpdate({_id: req.params.id, userId: decodedData.id}, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      let error = new AppError();
      error.statusCode = httpStatus.NOT_FOUND;
      error.errorCode = errorConstants.PLAN_NOT_FOUND;
      error.message = 'Plan not found';
      error.errors = {'id': req.params.id};
      return next(error);
    }
    res.send({
      status: 'success',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePlan = async (req, res, next) => {
  try {
    const dataValidator = new DataValidator();
    if (!dataValidator.validateMongoId(req.params.id)) {
      return next(dataValidator.getErrorObject());
    }
    let decodedData = jwt.decode(req.headers.authorization.split(' ')[1]);
    const result = await Plan.findOneAndDelete({_id: req.params.id, userId: decodedData.id});
    if (!result) {
      let error = new AppError();
      error.statusCode = httpStatus.NOT_FOUND;
      error.errorCode = errorConstants.PLAN_NOT_FOUND;
      error.message = 'Plan not found';
      error.errors = {'id': req.params.id};
      return next(error);
    } else {
      res.send({
        status: 'success',
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getPlan = async (req, res, next) => {
  try {
    const dataValidator = new DataValidator();
    if (!dataValidator.validateMongoId(req.params.id)) {
      return next(dataValidator.getErrorObject());
    }
    let decodedData = jwt.decode(req.headers.authorization.split(' ')[1]);
    const plan = await Plan.findOne({_id: req.params.id, userId: decodedData.id});
    if (!plan) {
      let error = new AppError();
      error.statusCode = httpStatus.NOT_FOUND;
      error.errorCode = errorConstants.PLAN_NOT_FOUND;
      error.message = 'Plan not found';
      error.errors = {'id': req.params.id};
      return next(error);
    }
    res.send({
      status: 'success',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPlans = async (req, res, next) => {
  try {
    let decodedData = jwt.decode(req.headers.authorization.split(' ')[1]);
    const planQuery = Plan.find({userId: decodedData.id});

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
    res.send({
      status: 'success',
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};