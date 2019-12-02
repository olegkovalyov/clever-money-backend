const httpStatus = require('http-status-codes');
const AppError = require('../classes/AppError');
const DataValidator = require('../classes/DataValidator');
const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const _ = require('lodash');
const errorConstants = require('../constants/Error');

exports.createUser = async (req, res, next) => {
  try {
    const dataValidator = new DataValidator();
    if (!dataValidator.validateName(req.body.name)
        || !dataValidator.validateEmail(req.body.email)
        || !dataValidator.validatePassword(req.body.password)
    ) {
      return next(dataValidator.getErrorObject());
    }

    let user = await User.findOne({email: req.body.email});
    if (user) {
      let error = new AppError();
      error.statusCode = httpStatus.BAD_REQUEST;
      error.message = 'There is already a user with this email';
      error.errorCode = errorConstants.USER_ALREADY_EXISTS;
      error.errors = {email: req.body.email};
      return next(error);
    }
    const hash = await bcrypt.hash(req.body.password, parseInt(process.env.SALT_ROUNDS));
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hash,
      active: true,
    });
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
    };
    const token = await promisify(jwt.sign)(payload, process.env.JWT_SECRET, {expiresIn: process.env.JTW_EXPIRATION});
    user = _.pick(user, ['_id', 'name', 'email', 'createdAt', 'updatedAt']);
    res.send({
      status: 'success',
      data: user,
      token: token,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const dataValidator = new DataValidator();
    if (!dataValidator.validateMongoId(req.params.id)) {
      return next(dataValidator.getErrorObject());
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      let error = new AppError();
      error.statusCode = httpStatus.NOT_FOUND;
      error.message = 'User not found';
      error.errorCode = errorConstants.USER_NOT_FOUND;
      error.errors = {'id': req.params.id};
      return next(error);
    }
    res.send({
      status: 'success',
      data: _.pick(user, ['_id', 'name', 'email', 'createdAt', 'updatedAt']),
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const dataValidator = new DataValidator();
    if (!dataValidator.validateEmail(req.body.email)
        || !dataValidator.validatePassword(req.body.password)
    ) {
      return next(dataValidator.getErrorObject());
    }

    let user = await User.findOne({email: req.body.email});
    if (!user
        || !await user.validatePassword(req.body.password)
    ) {
      let error = new AppError();
      error.statusCode = httpStatus.UNAUTHORIZED;
      error.message = 'Invalid email or password';
      error.errorCode = errorConstants.INVALID_EMAIL_OR_PASSWORD;
      error.errors = {};
      return next(error);
    }
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
    };
    const token = await promisify(jwt.sign)(payload, process.env.JWT_SECRET, {expiresIn: process.env.JTW_EXPIRATION});
    res.send({
      status: 'success',
      user: _.pick(user, ['_id', 'name', 'email', 'createdAt', 'updatedAt']),
      token: token,
    });
  } catch (error) {
    next(error);
  }
};