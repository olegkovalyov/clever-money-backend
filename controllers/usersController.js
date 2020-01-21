const httpStatus = require('http-status-codes');
const AppError = require('../classes/AppError');
const DataValidator = require('../classes/DataValidator');
const User = require('../models/User');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
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
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      active: true,
    });
    const token = await user.createJsonWebToken();
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
    user.password = req.body.password;
    await user.save();
    const token = await user.createJsonWebToken();
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
    const token = await user.createJsonWebToken();
    res.send({
      status: 'success',
      user: _.pick(user, ['_id', 'name', 'email', 'createdAt', 'updatedAt']),
      token: token,
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const dataValidator = new DataValidator();
    if (!dataValidator.validateEmail(req.body.email)) {
      return next(dataValidator.getErrorObject());
    }

    let user = await User.findOne({email: req.body.email});
    if (!user) {
      let error = new AppError();
      error.statusCode = httpStatus.BAD_REQUEST;
      error.message = 'Invalid email or user';
      error.errorCode = errorConstants.INVALID_EMAIL_OR_PASSWORD;
      error.errors = {};
      return next(error);
    }

    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const passwordResetToken = user.createPasswordResetToken();
    await user.save();

    try {
      let url = req.protocol + '://' + req.get('host');
      await transport.sendMail({
        from: 'support@clevermoney.com',
        to: user.email,
        subject: 'CleverMoney password reset',
        text: '<a href="http://localhost:3000/change-password/' + passwordResetToken +
            '">Click here to reset your password</a>',
      });
    } catch (nodeMailError) {
      let error = new AppError();
      error.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      error.message = 'Failed to send email';
      error.errorCode = errorConstants.FAILED_TO_SEND_EMAIL;
      error.errors = {};
      return next(error);
    }
    res.send({
      status: 'success',
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const dataValidator = new DataValidator();
    if (!dataValidator.validateResetToken(req.body.resetToken)
        || !dataValidator.validatePassword(req.body.password)
        || !dataValidator.validatePasswordConfirm(req.body.password, req.body.passwordConfirm)
    ) {
      return next(dataValidator.getErrorObject());
    }

    const hashedToken = crypto.createHash('sha256').update(req.body.resetToken).digest('hex');
    const user = await User.findOne({passwordResetToken: hashedToken});
    if (!user
        || !user.isResetTokenValid()
    ) {
      let error = new AppError();
      error.statusCode = httpStatus.BAD_REQUEST;
      error.errorCode = errorConstants.RESET_TOKEN_EXPIRED;
      error.message = 'User not found or token has expired';
      error.errors = {'resetToken': req.body.resetToken};
      return next(error);
    }
    user.password = req.body.password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    const token = await user.createJsonWebToken();
    res.send({
      status: 'success',
      data: _.pick(user, ['name', 'email', 'active', 'createdAt', 'updatedAt']),
      token: token,
    });
  } catch (error) {
    next(error);
  }
};
