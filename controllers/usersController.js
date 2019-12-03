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
    const dataValidator = new DataValidator();

    if (!dataValidator.validateMongoId(req.params.id)
        || !dataValidator.validateName(req.body.name)
        || !dataValidator.validateEmail(req.body.email)
        || !dataValidator.validatePassword(req.body.password)
    ) {
      return next(dataValidator.getErrorObject());
    }
    let user = req.locals.user;
    user.name = req.body.name;
    user.email = req.body.email;
    user.password = await bcrypt.hash(req.body.password, parseInt(process.env.SALT_ROUNDS));
    await user.save();
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
    };
    const token = await promisify(jwt.sign)(payload, process.env.JWT_SECRET, {expiresIn: process.env.JTW_EXPIRATION});
    res.send({
      status: 'success',
      data: _.pick(user, ['name', 'email', 'active', 'createdAt', 'updatedAt']),
      token: token,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const dataValidator = new DataValidator();

    if (!dataValidator.validateMongoId(req.params.id)) {
      return next(dataValidator.getErrorObject());
    }
    const result = await User.findOneAndDelete({_id: req.params.id});
    if (!result) {
      let error = new AppError();
      error.statusCode = httpStatus.NOT_FOUND;
      error.errorCode = errorConstants.USER_NOT_FOUND;
      error.message = 'User not found';
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
    const userQuery = User.find();

    // pagination
    if (req.query.pageNumber !== undefined
        && req.query.pageSize !== undefined
    ) {
      const pageNumber = parseInt(req.query.pageNumber) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      userQuery.skip((pageNumber - 1) * pageSize).limit(pageSize);
    }

    // sorting
    const sortFields = ['name', 'email', 'createdAt', 'updatedAt'];
    const directions = ['desc', 'asc'];
    if (req.query.sort !== undefined
        && req.query.direction !== undefined
        && sortFields.includes(req.query.sort)
        && directions.includes(req.query.direction)
    ) {
      const sortDirection = (req.query.direction === 'asc') ? 1 : -1;
      switch (req.query.sort) {
        case 'name':
          userQuery.sort({name: sortDirection});
          break;
        case 'email':
          userQuery.sort({email: sortDirection});
          break;
        case 'createdAt':
          userQuery.sort({createdAt: sortDirection});
          break;
        case 'updatedAt':
          userQuery.sort({updatedAt: sortDirection});
          break;
      }
    } else {
      userQuery.sort({createdAt: -1});
    }

    // execute query
    const users = await userQuery;
    let filteredUsers = [];
    users.forEach(user => {
      filteredUsers.push(_.pick(user, ['name', 'email', 'active', 'createdAt', 'updatedAt']));
    });
    res.send({
      status: 'success',
      data: filteredUsers,
    });
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